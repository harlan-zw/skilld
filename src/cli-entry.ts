#!/usr/bin/env node
/**
 * CLI entry point. Intercepts `skilld prepare` to run the fast path (~45ms)
 * before the full CLI loads (~200ms of module imports).
 */

// eslint-disable-next-line antfu/no-top-level-await
await import(process.argv[2] === 'prepare' && process.argv.length <= 3
  ? './prepare.ts'
  : './cli.ts',
)
