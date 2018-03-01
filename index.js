#!/usr/bin/env  node

const _ = require('lodash')
const {exitOKFn, exitError, exitMessage, exitErrorFn} = require('./exits')
const {getTasks, tasksJs} = require('./tasks')
const {run, runThenWatch} = require('./runner')
const columnify = require('columnify')
const contrib = require('./contrib')
const dotenv = require('dotenv')
const fs = require('pn/fs')
const globby = require('globby')
const log = require('./log')
const minimist = require('minimist')
const omelette = require('omelette')
const pkgJson = require('./package.json')
const sh = require('shelljs')
const emptyContent = ``

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
  default: {func: cra, desc: 'runs create-react-app server', deps: [clean], once: true}
}
*/
`
/* eslint-enable max-len */

async function commandInit(argv, content) {
  if (await fs.exists(tasksJs)) {
    exitError(`SKIPPED ${tasksJs} exists`)
  }
  return fs
    .writeFile(tasksJs, content, 'utf8')
    .then(exitOKFn(`${tasksJs} created`), exitErrorFn())
}

function taskList(tasks) {
  const indent = '  '
  const items = _.sortBy(tasks, 'name').map(it => ({
    name: it.name,
    desc: it.desc,
  }))
  const taskList = columnify(items, {
    showHeaders: false,
    columnSplitter: '  ',
  }).replace(/^/gm, indent)

  return 'Tasks\n' + taskList
}

function instructions() {
  return `Quick Start
    1. Edit ${tasksJs}
         export async function hello({argv}) {
           console.log('Hello, \${argv.name}!')
         }

    2. Run hello
         task hello --name foo`
}

function usage(tasks) {
  const body = tasks && tasks.length ? taskList(tasks) : instructions()

  return `${pkgJson.name} v${pkgJson.version} - no config task runner

Usage: task [options] [task_name] [task_options...]

Options
  --init              Create empty ${tasksJs} if not exists
  --init-example      Create example ${tasksJs} if not exists
  --no-dotenv         Do not parse .env file
  --setup-completion  Integrates auto completion with shell
  --verbose           Verbose logging
  --watch, -w         Watch mode
  --help, -?          Display this screen

${body}

Examples
  task
    Runs default task

  task hello world
    Runs task 'hello' with argv = {_: ['world']}

  task hello --name world
    Runs task 'hello' with argv = {name: 'world'}
`
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

const minimistOpts = {
  alias: {
    help: ['?'],
    watch: ['w'],
  },
  boolean: [
    'dotenv',
    'help',
    'init',
    'init-example',
    'watch',
    'setup-completion',
  ],
  default: {
    dotenv: true,
  },
}

async function setupTerminalAutoComplete() {
  const completion = omelette(`task <task>`)
  if (~process.argv.indexOf('--setup-completion')) {
    completion.setupShellInitFile()
  }
  const tasks = (await getTasks()) || []
  const names = tasks.map(t => t.name)
  completion.on('task', async ({reply}) => {
    reply(names)
  })
  completion.init()
}

async function main() {
  setupTerminalAutoComplete()

  const argv = minimist(process.argv.slice(2), minimistOpts)
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

  log.setLevel(argv.verbose ? 'debug' : 'info')

  const tasks = await getTasks()
  const name = taskToRun(tasks, argv)
  if (!name) exitMessage(usage(tasks))

  const args = taskArgs(argv)

  if (argv.watch) {
    return runThenWatch(tasks, name, args).then(exitOKFn(), exitErrorFn())
  }
  return run(tasks, name, args).then(exitOKFn(), exitErrorFn())
}

main()
