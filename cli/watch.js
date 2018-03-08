const _ = require('lodash')
const chokidar = require('chokidar')
const defaults = {usePolling: true}
const globby = require('globby')
const log = require('../core/log')
const util = require('../core/util')

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
      if (!firstRun) {
        log.info(message)
      }
      const newArgs = {...args, event}
      fn(newArgs)
      firstRun = false
    },
    1000,
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
      let id = 1
      const eventHandler = (ev, path) => {
        const idstr = `[${_.padStart(id++, 2, 0)}]`

        message = `\n${idstr} ${ev.toUpperCase()} ${path}`
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
