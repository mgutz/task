const _ = require('lodash')
const columnify = require('columnify')
const {exitError} = require('./exits')
const omelette = require('omelette')
const minimist = require('minimist')
const pkgJson = require('./package.json')

function taskList(tasks) {
  const taskArray = Object.values(tasks)
  if (!taskArray || taskArray.length < 1) {
    return 'No tasks found.'
  }

  const indent = '  '
  const items = _.sortBy(taskArray, 'name')
    .map(it => ({
      name: it.name,
      desc: it.desc,
    }))
    .filter(it => it.desc)
  return columnify(items, {
    showHeaders: false,
    columnSplitter: '  ',
  }).replace(/^/gm, indent)
}

const minimistOpts = {
  alias: {
    debug: ['verbose'],
    file: ['f'],
    help: ['?'],
    typescript: ['ts'],
    watch: ['w'],
  },
  boolean: [
    '?',
    'babel',
    'debug',
    'dotenv',
    'dry-run',
    'help',
    'init',
    'init-example',
    'list',
    'silent',
    'trace',
    'ts',
    'typescript',
    'verbose',
    'w',
    'watch',
  ],
  default: {
    babel: true,
    dotenv: true,
    silent: false,
    file: '',
  },
  string: ['f', 'file'],
  unknown: flag => {
    // omelette uses --comp*
    if (flag.indexOf('-') === 0 && flag.indexOf('--comp') !== 0) {
      exitError(`Unknown option: ${flag}`)
    }
  },
}

function parseArgv() {
  return minimist(process.argv.slice(2), minimistOpts)
}

function helpScreen() {
  return `${pkgJson.name} v${pkgJson.version} - no config task runner

Usage: task [options] [task] [task_options...]

Options
  --dry-run           Displays tasks that will run
  --file,-f           File
  --init              Create empty Taskfile.js if not exists
  --init-example      Create example Taskfile.js if not exists
  --list              List tasks
  --no-babel          Do not use babel
  --no-dotenv         Do not parse .env file
  --silent            No output
  --trace             More verbose logging
  --typescript,--ts   Force typescript
  --verbose,--debug   Verbose logging
  --watch,-w          Watch mode
  --help,-?           Display this screen

Quick Start
  1) Edit Taskfile.js
       export async function hello({argv}) {
         console.log('Hello, \${argv.name}!')
       }

  2) Run hello
       task hello --name foo

Examples
  task
    Runs default task

  task hello world
    Runs task 'hello' with argv = {_: ['world']}

  task hello --name world
    Runs task 'hello' with argv = {name: 'world'}

  task hello --dry-run
    Print the sequence of tasks that run up to and including hello

  task otherTaskFile.js hello world
    If first arg is a file that ends with {.js,.ts}, use it as the task file
    without requiring --file

  task hello world --trace
    Prints detailed internal diagnostics while task executes. --debug prints
    less information.
`
}

function usage(tasks, which = '') {
  if (which === 'help') {
    return helpScreen()
  }
  if (which === 'list') {
    tasksScreen(tasks)
  }

  return Object.keys(tasks).length ? tasksScreen(tasks) : helpScreen()
}

function tasksScreen(tasks) {
  return `task v${pkgJson.version}

Usage: task [options] [task] [task_options...]

Tasks
${taskList(tasks)}
`
}

async function setupTerminalAutoComplete(tasks) {
  const completion = omelette(`task <task>`)
  if (~process.argv.indexOf('--setup-completion')) {
    completion.setupShellInitFile()
  }
  const names = tasks.map(t => t.name)
  completion.on('task', async ({reply}) => {
    reply(names)
  })
  completion.init()
}

module.exports = {minimistOpts, parseArgv, setupTerminalAutoComplete, usage}
