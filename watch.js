const _ = require('lodash')
const chokidar = require('chokidar')
const defaults = {usePolling: true}
const globby = require('globby')
const log = require('./log')
const util = require('./util')

async function watch(globs, args, fn, opts = defaults) {
  const files = await globby(globs)
  if (files.length < 1) {
    log.warn('No files match watch globs', util.prettify(globs))
  }
  let firstRun = true
  let message = ''
  let event = {}

  const debounced = _.debounce(
    () => {
      const newArgs = Object.assign({}, args, {event})
      fn(newArgs)
      if (!firstRun) {
        log.info(message)
      }
      firstRun = false
    },
    1500,
    {leading: true, trailing: false}
  )

  return new Promise((resolve, reject) => {
    const watcher = chokidar.watch(globs, {
      ...opts,
      ignoreInitial: true,
    })

    watcher.once('ready', () => {
      log.debug('watching', util.prettify(globs))
      debounced()

      const eventHandler = (ev, path) => {
        message = `\n${ev.toUpperCase()} ${path}\n`
        event = {event: ev, path}
        debounced()
      }

      watcher.on('all', eventHandler)
    })

    watcher.once('error', err => {
      log.error(`Watcher error ${err}`)
      reject(err)
    })
  })
}

module.exports = watch
