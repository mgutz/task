import * as chokidar from 'chokidar'
import * as globby from 'globby'
import * as _ from 'lodash'
import log from './log'
import * as util from './util'

const defaults = {usePolling: true}

export async function watch(
  globs: string[],
  args: TaskParam,
  fn: TaskFunc,
  opts = defaults
) {
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

  return new Promise<void>((resolve, reject) => {
    const watcher = chokidar.watch(globs, {
      ...opts,
      ignoreInitial: true,
    })

    watcher.once('ready', () => {
      log.debug('watching', util.prettify(globs))
      debounced()
      let id = 1
      const eventHandler = (ev: string, path: string) => {
        const idstr = `[${_.padStart(String(id++), 2, '0')}]`

        message = `\n${idstr} ${ev.toUpperCase()} ${path}`
        event = {event: ev, path}
        debounced()
      }

      watcher.on('all', eventHandler)
    })

    watcher.once('error', (err: any) => {
      log.error(`Watcher error ${err}`)
      reject(err)
    })
  })
}
