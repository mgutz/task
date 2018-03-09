import * as _ from 'lodash'
import * as dotenv from 'dotenv'
import * as exits from '../core/exits'
import * as fp from 'path'
import * as fs from 'fs'
import * as server from '../gqlserver'
import * as terminal from './terminal'
import {AppContext} from '../core/AppContext'
import {findTaskfile, loadTasks} from '../core/tasks'
import {helpScreen, parseArgv, tasksScreen} from './usage'
import {konsole, newTerminalLogger, setLevel} from '../core/log'
import {run as commandInit} from '../core/commands/init'
import {safeParseJSON} from '../core/util'

const loadTaskrc = (workDir: string): Options => {
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

const main = async () => {
  let argv

  // when task is spawned by server, it passes in options through environment
  // variable
  if (process.env.task_ipc_options) {
    const [argv2, err] = safeParseJSON(process.env.task_ipc_options)
    if (err) {
      exits.error(err)
      return
    }
    argv = argv2
    process.env.task_ipc_options = undefined
  } else {
    // load taskrc early
    const taskrc = loadTaskrc(process.cwd())
    argv = parseArgv(taskrc)
  }

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
    const dotExt = fp.extname(firstArg)
    if (dotExt && argv.babelExtensions.indexOf(dotExt) > -1) {
      argv.file = firstArg
      // remove file from argv
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
    return exits.message(tasksScreen(tasks))
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
process.on('unhandledRejection', (rejected: any) => {
  konsole.error(rejected)
  process.exit(1)
})

main()
