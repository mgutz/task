const _ = require('lodash')
const {exitError} = require('./exits')
const fp = require('pn/path')
const fs = require('pn/fs')
const log = require('./log')
const tasksJs = 'Taskfile.js'

// standardize differences between es6 exports and commonJs exports
function standardizeExports(obj) {
  if (typeof obj === 'function' || _.isPlainObject(obj)) {
    return {default: obj}
  }
  return obj
}

async function getTasks(argv) {
  const jsFilename = fp.join(process.cwd(), tasksJs)
  if (!await fs.exists(jsFilename)) return null

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

  const taskFile = standardizeExports(require(jsFilename))
  const tasks = {}

  // Handle case where the export is of mix of default and exported
  // functions. Meta from default has higher precedence.
  for (let name in taskFile) {
    if (name === 'default') {
      continue
    }
    const obj = taskFile[name]
    if (typeof obj === 'function') {
      tasks[name] = {run: obj, name, desc: `run ${name}`}
    }
  }

  if (taskFile.default) {
    // convert exported default function
    if (typeof taskFile.default === 'function') {
      tasks.default = {
        run: taskFile.default,
        name: 'default',
        desc: `run exported default`,
      }
    } else if (_.isPlainObject(taskFile.default)) {
      const meta = taskFile.default

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
      const deps = Array.isArray(task.deps)
        ? task.deps.map(dep => depToName(tasks, task, dep))
        : null
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

function noop() {}

module.exports = {getTasks, tasksJs}
