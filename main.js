const _ = require('lodash')
const {exitOKFn, exitError, exitMessage, exitErrorFn} = require('./exits')
const {runnableRef, findTaskfile, loadTasks} = require('./tasks')
const {run, runThenWatch} = require('./runner')
const contrib = require('./contrib')
const dotenv = require('dotenv')
const fs = require('fs')
const fp = require('path')
const log = require('./log')
const {parseArgv, /*setupTerminalAutoComplete,*/ usage} = require('./usage')

const exampleEmpty = ``

/* eslint-disable max-len */
const exampleJs = `
export function clean({sh}) {
  sh.rm('-rf', 'build')
}

export function installTools({sh}) {
  sh.exec('go get -u github.com/mgutz/dat/cmd/dat')
}

export async function start(ctx) {
  return ctx.shawn(\`npm start\`)
}

/*
export default start
*/
`

const exampleTs = `
export function clean({sh}) {
  sh.rm('-rf', 'build')
}

export function installTools({sh}) {
  sh.exec('go get -u github.com/mgutz/dat/cmd/dat')
}

export async function start(ctx) {
  return ctx.shawn(\`npm start\`)
}

/*
export default start
*/
`

const exampleTaskrc = `
module.exports = {
  // debug: true,
  // file: 'Taskfile.mjs'
}
`

let _tasks

/* eslint-enable max-len */

async function commandInit(argv) {
  const taskfile = argv.typescript ? 'Taskfile.ts' : 'Taskfile.js'
  const taskrcPath = fp.join(process.cwd(), '.taskrc')
  const taskfilePath = fp.join(process.cwd(), taskfile)
  const content = argv['init-example']
    ? argv.typescript ? exampleTs : exampleJs
    : exampleEmpty

  if (fs.existsSync(taskfilePath)) {
    exitError(`SKIPPED ${taskfilePath} exists`)
  }

  if (!fs.existsSync(taskrcPath)) {
    fs.writeFileSync(taskrcPath, exampleTaskrc, 'utf8')
    log.info('OK .taskrc created')
  }

  return fs
    .writeFile(taskfilePath, content, 'utf8')
    .then(exitOKFn(`${taskfilePath} created`), exitErrorFn())
}

function taskToRun(argv) {
  return argv._[0]
}

function taskArgs(argv) {
  const sh = require('shelljs')
  const globby = require('globby')
  const prompt = require('inquirer').createPromptModule()

  const execAsync = (...args) => {
    return new Promise((resolve, reject) => {
      sh.exec(...args, (code, stdout, stderr) => {
        if (code !== 0) return reject({code, stdout, stderr})
        return resolve({code, stdout, stderr})
      })
    })
  }

  return {
    _,
    argv: Object.assign({}, argv, {_: argv._.slice(1)}), // drop the command
    contrib,
    exec: execAsync,
    globby,
    prompt,
    sh,
    shawn: contrib.shawn,
  }
}

function loadTaskrc(wd) {
  const taskrc = fp.join(wd, '.taskrc')
  if (fs.existsSync(taskrc)) {
    const obj = require(taskrc)
    if (obj.file && !fs.existsSync(fp.join(wd, obj.file))) {
      exitError(`File specified in ${taskrc} not found: ${obj.file}`)
    }
    return obj
  }
  return {}
}

async function main() {
  // load taskrc early
  let taskrc = loadTaskrc(process.cwd())

  const minArgv = parseArgv()
  const argv = Object.assign({}, taskrc, minArgv)

  if (argv.gui) {
    exitError('--gui not yet implemented')
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

  if (argv.silent) {
    log._setLevel('silent')
  } else if (argv.trace) {
    log._setLevel('trace')
  } else if (argv.debug) {
    log._setLevel('debug')
  } else {
    log._setLevel('info')
  }
  const tasks = (await loadTasks(argv, taskfilePath)) || []

  //setupTerminalAutoComplete(tasks)

  if (argv.dotenv) {
    dotenv.config()
  }
  if (argv.help) {
    return exitMessage(usage(tasks, 'help'))
  }
  if (argv.list) {
    return exitMessage(usage(tasks, 'list'))
  }
  if (argv.init || argv['init-example']) {
    return await commandInit(argv)
  }

  const taskName = taskToRun(argv)
  if (!taskName && !runnableRef(tasks, 'default')) {
    exitMessage(usage(tasks))
  }

  const name = runnableRef(tasks, taskName || 'default')
  if (!name) {
    exitError(`Task not found:  ${argv._[0]}`)
  }

  const args = taskArgs(argv)

  if (argv.watch) {
    return runThenWatch(tasks, name, args).then(exitOKFn(), exitErrorFn())
  }
  return run(tasks, name, args).then(exitOKFn(), exitErrorFn())
}

process.on('unhandledRejection', (...args) => {
  // eslint-disable-next-line no-console
  console.error(...args)
  process.exit(1)
})

main()
