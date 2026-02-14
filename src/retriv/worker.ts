import type { IndexConfig, Document as RetrivDocument } from './types.ts'
import { parentPort } from 'node:worker_threads'
import { createRetriv } from 'retriv'
import { autoChunker } from 'retriv/chunkers/auto'
import sqlite from 'retriv/db/sqlite'
import { transformersJs } from 'retriv/embeddings/transformers-js'
import { cachedEmbeddings } from './embedding-cache.ts'

export interface WorkerIndexMessage {
  type: 'index'
  id: number
  documents: RetrivDocument[]
  dbPath: string
}

export interface WorkerShutdownMessage {
  type: 'shutdown'
}

export type WorkerMessage = WorkerIndexMessage | WorkerShutdownMessage

export interface WorkerProgressResponse {
  type: 'progress'
  id: number
  phase: string
  current: number
  total: number
}

export interface WorkerDoneResponse {
  type: 'done'
  id: number
}

export interface WorkerErrorResponse {
  type: 'error'
  id: number
  message: string
}

export type WorkerResponse = WorkerProgressResponse | WorkerDoneResponse | WorkerErrorResponse

if (parentPort) {
  parentPort.on('message', async (msg: WorkerMessage) => {
    if (msg.type === 'shutdown') {
      process.exit(0)
    }

    if (msg.type === 'index') {
      const { id, documents, dbPath } = msg

      try {
        const config: IndexConfig = {
          dbPath,
          onProgress: ({ phase, current, total }) => {
            parentPort!.postMessage({ type: 'progress', id, phase, current, total } satisfies WorkerProgressResponse)
          },
        }

        const db = await createRetriv({
          driver: sqlite({
            path: config.dbPath,
            embeddings: cachedEmbeddings(transformersJs()),
          }),
          chunking: autoChunker(),
        })

        await db.index(documents, { onProgress: config.onProgress })
        await db.close?.()

        parentPort!.postMessage({ type: 'done', id } satisfies WorkerDoneResponse)
      }
      catch (err) {
        parentPort!.postMessage({
          type: 'error',
          id,
          message: err instanceof Error ? err.message : String(err),
        } satisfies WorkerErrorResponse)
      }
    }
  })
}
