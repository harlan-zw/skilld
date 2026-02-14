import type { DatabaseSync } from 'node:sqlite'
import type { Embedding } from 'retriv'
import { rmSync } from 'node:fs'
import { join } from 'pathe'
import { cachedEmbeddings as retrivCached } from 'retriv/embeddings/cached'
import { CACHE_DIR } from '../cache/index.ts'

interface EmbeddingConfig {
  resolve: () => Promise<{ embedder: (texts: string[]) => Promise<Embedding[]>, dimensions: number, maxTokens?: number }>
}

const EMBEDDINGS_DB_PATH = join(CACHE_DIR, 'embeddings.db')

function openDb(): DatabaseSync {
  // eslint-disable-next-line ts/no-require-imports
  const { DatabaseSync: DB } = require('node:sqlite') as typeof import('node:sqlite')
  const db = new DB(EMBEDDINGS_DB_PATH)
  db.exec('PRAGMA journal_mode=WAL')
  db.exec('PRAGMA busy_timeout=5000')
  db.exec(`CREATE TABLE IF NOT EXISTS embeddings (text_hash TEXT PRIMARY KEY, embedding BLOB NOT NULL)`)
  db.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`)
  return db
}

function createSqliteStorage(db: DatabaseSync) {
  const getStmt = db.prepare('SELECT embedding FROM embeddings WHERE text_hash = ?')
  const setStmt = db.prepare('INSERT OR IGNORE INTO embeddings (text_hash, embedding) VALUES (?, ?)')

  return {
    get: (hash: string): Embedding | null => {
      const row = getStmt.get(hash) as { embedding: Buffer } | undefined
      if (!row)
        return null
      return new Float32Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.byteLength / 4)
    },
    set: (hash: string, embedding: Embedding): void => {
      const arr = embedding instanceof Float32Array ? embedding : new Float32Array(embedding)
      setStmt.run(hash, Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength))
    },
  }
}

export function cachedEmbeddings(config: EmbeddingConfig): EmbeddingConfig {
  const db = openDb()
  const storage = createSqliteStorage(db)

  // Validate dimensions on first resolve
  const originalResolve = config.resolve
  const validatedConfig: EmbeddingConfig = {
    async resolve() {
      const resolved = await originalResolve()
      const getMetaStmt = db.prepare('SELECT value FROM meta WHERE key = ?')
      const setMetaStmt = db.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)')

      const storedDims = getMetaStmt.get('dimensions') as { value: string } | undefined
      if (storedDims && Number(storedDims.value) !== resolved.dimensions) {
        db.exec('DELETE FROM embeddings')
      }
      setMetaStmt.run('dimensions', String(resolved.dimensions))

      return resolved
    },
  }

  return retrivCached(validatedConfig, { storage })
}

export function clearEmbeddingCache(): void {
  rmSync(EMBEDDINGS_DB_PATH, { force: true })
}
