const _ = require('lodash')
const {exitOKFn, exitError, exitMessage, exitErrorFn} = require('./exits')
const {loadTasks} = require('./tasks')
const {run, runThenWatch} = require('./runner')
const contrib = require('./contrib')
const dotenv = require('dotenv')
const fs = require('pn/fs')
const fp = require('path')
const globby = require('globby')
const log = require('./log')
const sh = require('shelljs')
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

let _tasks

/* eslint-enable max-len */

async function commandInit(argv) {
  const taskfile = argv.typescript ? 'Taskfile.ts' : 'Taskfile.js'
  const taskfilePath = fp.join(process.cwd(), taskfile)
  const content = argv['init-example']
    ? argv.typescript ? exampleTs : exampleJs
    : exampleEmpty

  if (await fs.exists(taskfilePath)) {
    exitError(`SKIPPED ${taskfilePath} exists`)
  }

  return fs
    .writeFile(taskfilePath, content, 'utf8')
    .then(exitOKFn(`${taskfilePath} created`), exitErrorFn())
}

function taskToRun(argv) {
  return argv._[0]
}

function isRunnable(tasks, name) {
  if (name) {
    const found = _.find(tasks, {name})
    if (found) return name
  } else {
    const found = _.find(tasks, {name: 'default'})
    if (found) return 'default'
  }
  return null
}

const execAsync = (...args) => {
  return new Promise((resolve, reject) => {
    sh.exec(...args, (code, stdout, stderr) => {
      if (code !== 0) return reject({code, stdout, stderr})
      return resolve({code, stdout, stderr})
    })
  })
}

function taskArgs(argv) {
  return {
    _,
    argv: Object.assign({}, argv, {_: argv._.slice(1)}), // drop the command
    contrib,
    exec: execAsync,
    globby,
    sh,
    shawn: contrib.shawn,
  }
}

async function main() {
  const argv = parseArgv()
  if (argv.silent) {
    log.setLevel('silent')
  } else if (argv.trace) {
    log.setLevel('trace')
  } else if (argv.debug) {
    log.setLevel('debug')
  } else {
    log.setLevel('info')
  }
  const tasks = (await loadTasks(argv)) || []

  //setupTerminalAutoComplete(tasks)

  if (argv.dotenv) {
    dotenv.config()
  }
  if (argv.help) {
    return exitMessage(usage(tasks))
  }
  if (argv.init || argv['init-example']) {
    return await commandInit(argv)
  }

  const taskName = taskToRun(argv)
  if (!taskName && !isRunnable(tasks, 'default')) {
    exitMessage(usage(tasks))
  }

  const name = isRunnable(tasks, taskName || 'default')
  if (!name) {
    exitError(`Task not found:  ${argv._[0]}`)
  }

  const args = taskArgs(argv)

  if (argv.watch) {
    return runThenWatch(tasks, name, args).then(exitOKFn(), exitErrorFn())
  }
  return run(tasks, name, args).then(exitOKFn(), exitErrorFn())
}

// eslint-disable-next-line no-console
process.on('unhandledRejection', (...args) => {
  console.error(...args)
  process.exit(1)
})

main()
