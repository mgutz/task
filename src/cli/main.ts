import * as _ from 'lodash'
import * as contrib from '../contrib'
import * as dotenv from 'dotenv'
import * as exits from '../core/exits'
import * as fp from 'path'
import * as fs from 'fs'
import * as server from '../gqlserver'
import * as terminal from './terminal'
import log, {setLevel} from '../core/log'
import {defaults, parseArgv, usage} from './usage'
import {findTaskfile, loadTasks, runnableRef} from '../core/tasks'
import {run, runThenWatch} from '../core/runner'
import {run as commandInit} from '../core/commands/init'
import {trace} from '../core/util'

let _tasks

function loadTaskrc(wd: string): Options {
  const taskrc = fp.join(wd, '.taskrc')
  if (fs.existsSync(taskrc)) {
    const obj = require(taskrc)
    if (obj.file && !fs.existsSync(fp.join(wd, obj.file))) {
      exits.error(`File specified in ${taskrc} not found: ${obj.file}`)
    }
    return obj
  }
  return {} as Options
}

async function main() {
  // load taskrc early
  let taskrc = loadTaskrc(process.cwd())

  const minArgv = parseArgv()
  const argv = Object.assign({}, defaults, taskrc, minArgv)

  if (argv.silent) {
    setLevel('silent')
  } else if (argv.trace) {
    setLevel('trace')
  } else if (argv.debug) {
    setLevel('debug')
  } else {
    setLevel('info')
  }

  trace('mingArgv', minArgv)
  trace('ARGV', argv)

  if (argv.gui) {
    exits.error('--gui not yet implemented')
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
  // TODO load taskrc again and merge with minArgv

  const tasks = await loadTasks(argv, taskfilePath)

  //setupTerminalAutoComplete(tasks)

  if (argv.dotenv) {
    dotenv.config()
  }
  if (argv.help) {
    return exits.message(usage(tasks, 'help'))
  }
  if (argv.list) {
    return exits.message(usage(tasks, 'list'))
  }

  const ctx = {tasks, options: argv}
  if (argv.init || argv.initExample) {
    return await commandInit(ctx)
  }

  if (argv.gui) {
    return server.run(ctx)
  }
  return terminal.run(ctx)
}

process.on('unhandledRejection', (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.error(...args)
  process.exit(1)
})

main()
