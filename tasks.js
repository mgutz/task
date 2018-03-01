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
    const obj = taskFile[name]
    if (typeof obj === 'function') {
      tasks[name] = {func: obj, name, desc: `run ${name}`, deps: undefined}
    }
  }

  if (taskFile.default) {
    // convert exported default function
    if (typeof taskFile.default === 'function') {
      tasks.default = {
        func: taskFile.default,
        name: 'default',
        desc: `run exported default`,
        deps: undefined,
      }
    } else if (_.isPlainObject(taskFile.default)) {
      const meta = taskFile.default

      // convert exported default object
      for (let name in meta) {
        const taskdef = meta[name]
        let {func, desc, deps} = taskdef

        // if the name is the same as a func, and func is not set, use the
        // func  as the func for this task
        if (!func && tasks[name] && typeof tasks[name].func === 'function') {
          func = tasks[name].func
        }

        if (!func && !Array.isArray(deps)) {
          exitError(`${name} is misspelled or missing 'deps'`)
        }

        // deps come in as function references, convert to name references
        // for depedency resolution
        const nameDeps = deps
          ? deps.map(fn => typeof fn === 'function' && fn.name)
          : undefined

        tasks[name] = {
          ...taskdef,
          func: func || noop,
          name,
          desc: desc || `run ${nameDeps} ${func ? name : ''}`,
          deps: nameDeps,
        }
      }
    }
  }

  return Object.values(tasks)
}

function noop() {}

module.exports = {getTasks, tasksJs}
