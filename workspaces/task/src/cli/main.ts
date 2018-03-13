import * as _ from 'lodash'
import * as dotenv from 'dotenv'
import * as exits from '../core/exits'
import * as fp from 'path'
import * as fs from 'fs'
import * as server from '../wsserver'
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

const setLogLevel = (argv: Options) => {
  if (argv.silent) {
    setLevel('silent')
  } else if (argv.trace) {
    setLevel('trace')
  } else if (argv.debug) {
    setLevel('debug')
  } else {
    setLevel('info')
  }
}

const loadOptions = (): Options => {
  let argv

  // when task is spawned by server, it passes in options through environment
  // variable
  if (process.env.task_ipc_options) {
    const [argv2, err] = safeParseJSON(process.env.task_ipc_options)
    if (err) {
      // @ts-ignore, exits the app
      return exits.error(err)
    }
    argv = argv2
    process.env.task_ipc_options = undefined
    return argv
  }
  // load taskrc early
  const taskrc = loadTaskrc(process.cwd())
  return parseArgv(process.argv.slice(2), taskrc)
}

// if the first arg has a known extension, use it as the task file
const setFileOnFirstArgExt = (argv: Options) => {
  if (argv._.length) {
    const firstArg = argv._[0]
    const dotExt = fp.extname(firstArg)
    if (dotExt && argv.babelExtensions.indexOf(dotExt) > -1) {
      argv.file = firstArg
      // remove file from argv
      argv._.shift()
    }
  }
}

const main = async () => {
  const argv = loadOptions()
  if (argv.help) {
    return exits.message(helpScreen())
  }

  setLogLevel(argv)
  setFileOnFirstArgExt(argv)

  const taskfilePath = findTaskfile(argv)
  if (!taskfilePath) {
    if (argv.file) {
      exits.error(`Tasks file not found: ${argv.file}`)
      return null
    }
    return exits.message(helpScreen())
  }

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

main()
