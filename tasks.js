const _ = require('lodash')
const {exitError} = require('./exits')
const fp = require('pn/path')
const fs = require('pn/fs')
const log = require('./log')

// Standardize differences between es6 exports and commonJs exports. The rest
// of the code assumes the task file is in es6.
function standardizeExports(argv, taskFile) {
  if (
    !argv.babel &&
    (typeof taskFile === 'function' || _.isPlainObject(taskFile))
  ) {
    taskFile.default = taskFile
  }
  return taskFile
}

const isParallelDep = dep => dep && _.isPlainObject(dep.p)
const isSerialDep = dep => Array.isArray(dep)
const isDep = dep => isParallelDep(dep) || isSerialDep(dep)

function standardizeDeps(tasks, task) {
  if (!tasks.deps) return null

  // deps come in as function variables, convert to name references
  // for depedency resolution
  const deps = isDep(tasks.deps)
    ? task.deps.map(dep => depToName(tasks, task, dep))
    : null

  return deps
}

function clearRan(tasks) {
  for (const task of tasks) {
    task._ran = false
  }
}

/**
 * Loads and standardize tasks.
 *
 * type task struct {
 *
 *  deps []string
 *  desc string
 *  name string
 *  once bool
 *  run function
 *  isParallelized bool
 *  _ran bool       // whether task ran on current watch change
 * }
 */
async function loadTasks(argv) {
  const taskfilePath = fp.join(process.cwd(), argv.file)
  if (!await fs.exists(taskfilePath)) return null

  if (argv.babel) {
    log.debug('using @babel/preset-env')
    // MUST use full path or babel tries to load @babel/preset-env relative to cwd
    const babelrc = {
      presets: [
        [
          fp.join(__dirname, 'node_modules', '@babel', 'preset-env'),
          {targets: {node: 'current'}},
        ],
      ],
    }
    require('@babel/register')(babelrc)
  }

  const taskfileExports = standardizeExports(argv, require(taskfilePath))
  const tasks = {}
  for (let name in taskfileExports) {
    if (name === 'default') {
      continue
    }
    const obj = taskfileExports[name]
    if (typeof obj === 'function') {
      tasks[name] = {run: obj, name, desc: `run ${name}`}
    }
  }

  if (taskfileExports.default) {
    // convert exported default function
    if (typeof taskfileExports.default === 'function') {
      tasks.default = {
        run: taskfileExports.default,
        name: 'default',
        desc: `run exported default`,
      }
    } else if (_.isPlainObject(taskfileExports.default)) {
      const meta = taskfileExports.default

      // convert exported default object
      for (let name in meta) {
        const taskdef = meta[name]

        if (typeof taskdef === 'function') {
          tasks[name] = {
            run: taskdef,
            name,
            desc: `run ${name}`,
          }
          continue
        }

        let {run, desc, deps} = taskdef

        // if the name is of an existing fucntion, and run is not set, use the
        // function as the run for this task
        if (!run && tasks[name] && typeof tasks[name].run === 'function') {
          run = tasks[name].run
        }

        if (!run && !Array.isArray(deps)) {
          exitError(`${name} is misspelled or missing 'deps'`)
        }

        tasks[name] = {...taskdef, run, name, desc}
      }
    } else {
      exitError(`default must be a function or metadata object`)
    }

    // fill in anything missing
    for (let name in tasks) {
      const task = tasks[name]
      // deps come in as function variables, convert to name references
      // for depedency resolution
      const deps = standardizeDeps(tasks, task)
      const desc = deps ? `run ${deps} ${task.name}` : `run ${task.name}`

      task.deps = deps
      task.desc = task.desc || desc
    }
  }

  const all = Object.values(tasks)
  log.debug('tasks', all)
  return all
}

let nameId = 0
function uniqueName() {
  nameId++
  return `anon${nameId}`
}

function depToName(tasks, task, dep) {
  if (_.isString(dep)) {
    if (tasks[dep]) {
      return dep
    }
    exitError(`Task ${task.name} has invalid ${dep} dependency`)
  } else if (typeof dep === 'function') {
    if (dep.name) {
      return dep.name
    }

    // anonymous functions need to be in tasks too
    const name = uniqueName()
    tasks[name] = {
      name,
      run: dep,
    }
    return name
  }

  exitError(`Task ${task.name} has invalid ${dep} dependency`)
}

module.exports = {clearRan, loadTasks}
