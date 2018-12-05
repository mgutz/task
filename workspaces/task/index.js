#!/usr/bin/env  node

/* eslint-disable no-console */

/**
 * Handler for unhandled promises.
 */
process.on('unhandledRejection', (rejected) => {
  console.error(rejected)
  process.exit(1)
})

require('./dist/cli/main')
