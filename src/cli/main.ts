import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as fp from 'path'
import * as contrib from '../contrib'
import {run as commandInit} from '../core/commands/init'
import * as exits from '../core/exits'
import {run, runThenWatch} from '../core/runner'
import {findTaskfile, loadTasks, runnableRef} from '../core/tasks'
import {trace} from '../core/util'
import * as server from '../gqlserver'
import * as terminal from './terminal'
import {helpScreen, parseArgv, usage} from './usage'
import {AppContext} from '../core/AppContext'
import {konsole, newTerminalLogger, setLevel} from '../core/log'

function loadTaskrc(workDir: string): Options {
  const taskrc = fp.join(workDir, '.taskrc')
  if (fs.existsSync(taskrc)) {
    const obj = require(taskrc)
    if (obj.file && !fs.existsSync(fp.join(workDir, obj.file))) {
      exits.error(`File specified in ${taskrc} not found: ${obj.file}`)
    }
    return obj
  }
  return {} as Options
}

async function main() {
  // load taskrc early
  const taskrc = loadTaskrc(process.cwd())

  const argv = parseArgv()
  if (argv.help) {
    return exits.message(helpScreen())
  }

  if (argv.silent) {
    setLevel('silent')
  } else if (argv.trace) {
    setLevel('trace')
  } else if (argv.debug) {
    setLevel('debug')
  } else {
    setLevel('info')
  }

  // if the first arg has a known extension, use it as the task file
  if (argv._.length) {
    const firstArg = argv._[0]
    if (firstArg.endsWith('.js') || firstArg.endsWith('.ts')) {
      argv.file = firstArg
      argv._.shift()
    }
  }

  const taskfilePath = findTaskfile(argv)
  if (!taskfilePath) {
    if (argv.file) {
      exits.error(`Tasks file not found: ${argv.file}`)
      return null
    }
    return exits.message(helpScreen())
  }
  // TODO load taskrc again and merge with minArgv

  const tasks = await loadTasks(argv, taskfilePath)
  if (!tasks) {
    return exits.error(`Cannot load tasks from: ${taskfilePath}`)
  }

  if (argv.dotenv) {
    dotenv.config()
  }
  if (argv.list) {
    return exits.message(usage(tasks, 'list'))
  }

  const ctx = new AppContext(tasks, argv, konsole)

  if (argv.init || argv.initExample) {
    return await commandInit(ctx)
  }

  if (argv.gui) {
    return server.run(ctx)
  }
  ctx.log = newTerminalLogger()
  return terminal.run(ctx)
}

/**
 * Handler for unhandled promises.
 */
process.on('unhandledRejection', (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.error(...args)
  process.exit(1)
})

main()
