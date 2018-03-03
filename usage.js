const _ = require('lodash')
const columnify = require('columnify')
const {exitError} = require('./exits')
const omelette = require('omelette')
const minimist = require('minimist')
const pkgJson = require('./package.json')

function taskList(tasks) {
  const indent = '  '
  const items = _.sortBy(tasks, 'name')
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
    'silent',
    'setup-completion',
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
    if (flag.indexOf('-') > -1 && flag.indexOf('--comp') !== 0) {
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
  --no-babel          Do not use babel
  --no-dotenv         Do not parse .env file
  --setup-completion  Integrates auto completion with shell
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
`
}

function usage(tasks) {
  return tasks && tasks.length ? tasksScreen(tasks) : helpScreen()
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
