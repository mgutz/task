#!/usr/bin/env  node

/**
 * Handler for unhandled promises.
 */
process.on('unhandledRejection', (rejected) => {
  console.error(rejected)
  process.exit(1)
})

require('./dist/cli/main')
