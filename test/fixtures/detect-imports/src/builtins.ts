import { AsyncLocalStorage } from 'node:async_hooks'
import { channel } from 'node:diagnostics_channel'
import { connect } from 'node:http2'
import { Session } from 'node:inspector'
import { describe, it } from 'node:test'
import { createTracing } from 'node:trace_events'

export const storage = new AsyncLocalStorage()
export const ch = channel('app')
export const session = new Session()
export { connect, describe, it, createTracing }
