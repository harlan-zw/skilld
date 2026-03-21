import type { IndexConfig, Document as RetrivDocument } from './types.ts'
import { parentPort } from 'node:worker_threads'

export interface WorkerIndexMessage {
  type: 'index'
  id: number
  documents: RetrivDocument[]
  dbPath: string
  /** Exact IDs (including chunk IDs) to remove before indexing */
  removeIds?: string[]
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

        const { getDb } = await import('./index.ts')
        const db = await getDb(config)
        if (msg.removeIds?.length)
          await db.remove?.(msg.removeIds)
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
