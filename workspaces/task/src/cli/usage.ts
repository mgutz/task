import * as columnify from 'columnify'
import * as _ from 'lodash'
import * as minimist from 'minimist'

// tslint:disable-next-line
const pkgJson = require('../../package.json')

const minimistOpts = {
  alias: {
    babelExtensions: ['babel-extensions'],
    debug: ['verbose'],
    dryRun: ['dry-run'],
    file: ['f'],
    help: ['?'],
    initExample: ['init-example'],
    typescript: ['ts'],
    watch: ['w'],
  },
  boolean: [
    '?',
    'babel',
    'debug',
    'dotenv',
    'dry-run',
    'dryRun',
    'gui',
    'help',
    'init',
    'init-example',
    'initExample',
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
    babelExtensions: ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'],
    dotenv: true,
    file: '',
  },
  string: ['f', 'file', 'babelExtensions'],
}

export const parseArgv = (defaultOverrides = {}): Options => {
  return minimist(process.argv.slice(2), {
    ...minimistOpts,
    default: {...minimistOpts.default, ...defaultOverrides},
  } as any) as Options
}

export const helpScreen = () => {
  return `${pkgJson.name} v${pkgJson.version} - no config task runner

Usage: task [options] [task] [task_options...]

Options
  --debug,--verbose   Debug logging
  --dry-run           Displays tasks that will run
  --file,-f           File
  --gui               Run GUI server. Browse http://localhost:4200
  --init              Create empty Taskfile.js if not exists
  --init-example      Create example Taskfile.js if not exists
  --list              List tasks
  --no-babel          Do not use babel
  --no-dotenv         Do not parse .env file
  --silent            No output
  --trace             More verbose logging
  --typescript,--ts   Force typescript
  --watch,-w          Watch mode
  --help,-?           Display this screen

Advanced options
  --babel-extensions  File extensions that babel should process when requiring.
                      Default ['.js','.jsx','.es6','.es','.mjs','.ts','.tsx']

Configuration File .taskrc
    module.exports = {
      "babel-extensions": ['.js','.es6','.es','.mjs'],
      file: 'Taskfile.es7'
    }

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

const taskList = (tasks: Tasks) => {
  const taskArray = Object.values(tasks)
  if (!taskArray || taskArray.length < 1) {
    return 'No tasks found.'
  }

  const indent = '  '
  const items = _.sortBy(taskArray, 'name')
    .map((it: Task) => ({
      desc: it.desc,
      name: it.name,
    }))
    .filter((it: Task) => it.desc)
  return columnify(items, {
    columnSplitter: '  ',
    columns: ['name', 'desc'],
    showHeaders: false,
  }).replace(/^/gm, indent)
}

export const usage = (tasks: Tasks): string => {
  return Object.keys(tasks).length ? tasksScreen(tasks) : helpScreen()
}

export const tasksScreen = (tasks: Tasks): string => {
  return `task v${pkgJson.version}

Usage: task [options] [task] [task_options...]

Options
  --help,-?  Print all options

Tasks
${taskList(tasks)}
`
}
