const _ = require('lodash')
const {exitOKFn, exitError, exitMessage, exitErrorFn} = require('./exits')
const {loadTasks} = require('./tasks')
const {run, runThenWatch} = require('./runner')
const contrib = require('./contrib')
const dotenv = require('dotenv')
const fs = require('pn/fs')
const globby = require('globby')
const log = require('./log')
const sh = require('shelljs')
const emptyContent = ``
const {parseArgv, setupTerminalAutoComplete, usage} = require('./usage')

/* eslint-disable max-len */
const exampleContent = `
export function clean({sh}) {
  sh.rm('-rf', 'build')
}

export function installTools() {
  sh.exec(\`go get -u github.com/mgutz/dat/cmd/dat\`)
}

export async function cra({contrib}) {
  return contrib.shawn(\`npm start\`)
}

/*
export default {
  default: {run: cra, desc: 'runs create-react-app server', deps: [clean], once: true}
}
*/
`

let _tasks

/* eslint-enable max-len */

async function commandInit(argv, content) {
  const taskfilePath = argv.file

  if (await fs.exists(taskfilePath)) {
    exitError(`SKIPPED ${taskfilePath} exists`)
  }
  return fs
    .writeFile(taskfilePath, content, 'utf8')
    .then(exitOKFn(`${taskfilePath} created`), exitErrorFn())
}

function taskToRun(tasks, argv) {
  const name = argv._[0]
  if (name) {
    const found = _.find(tasks, {name})
    if (found) return name
  } else {
    const found = _.find(tasks, {name: 'default'})
    if (found) return 'default'
  }
  return null
}

function taskArgs(argv) {
  return {
    _,
    argv: Object.assign({}, argv, {_: argv._.slice(1)}), // drop the command
    contrib,
    globby,
    sh,
  }
}

async function main() {
  const argv = parseArgv()
  if (argv.trace) {
    log.setLevel('trace')
  } else if (argv.verbose) {
    log.setLevel('debug')
  } else {
    log.setLevel('info')
  }
  const tasks = (await loadTasks(argv)) || []

  setupTerminalAutoComplete(tasks)

  if (argv.dotenv) {
    dotenv.config()
  }
  if (argv.help) {
    return exitMessage(usage(tasks))
  }
  if (argv.init) {
    return await commandInit(argv, emptyContent)
  }
  if (argv['init-example']) {
    return await commandInit(argv, exampleContent)
  }

  const name = taskToRun(tasks, argv)
  if (!name) exitMessage(usage(tasks))

  const args = taskArgs(argv)

  if (argv.watch) {
    return runThenWatch(tasks, name, args).then(exitOKFn(), exitErrorFn())
  }
  return run(tasks, name, args).then(exitOKFn(), exitErrorFn())
}

// eslint-disable-next-line no-console
process.on('unhandledRejection', console.error)

main()
