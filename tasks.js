const _ = require('lodash')
const {exitError} = require('./exits')
const fp = require('pn/path')
const fs = require('pn/fs')
const tasksJs = 'Taskfile.js'

async function getTasks() {
  const jsFilename = fp.join(process.cwd(), tasksJs)
  if (!await fs.exists(jsFilename)) return null

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
  const taskFile = require(jsFilename)

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
      task.run = task.run || noop
    }
  }

  return Object.values(tasks)
}

function depToName(tasks, task, dep) {
  if (_.isString(dep)) {
    if (tasks[dep]) {
      return dep
    }
    exitError(`Task ${task.name} has invalid ${dep} dependency`)
  } else if (typeof dep === 'function') {
    // anonymous functions need to be in tasks too
    if (!tasks[dep.name]) {
      tasks[dep.name] = {
        name: dep.name,
        run: dep,
      }
    }
    return dep.name
  }

  exitError(`Task ${task.name} has invalid ${dep} dependency`)
}

function noop() {}

module.exports = {getTasks, tasksJs}
