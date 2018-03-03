const _ = require('lodash')
const {exitError} = require('./exits')
const fp = require('pn/path')
const fs = require('pn/fs')
const log = require('./log')
const {prettify} = require('./util')

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

// {p: [dep1, dep2]}
const isParallel = dep => dep && Array.isArray(dep.p)

// [dep1, dep2]
const isSerial = dep => Array.isArray(dep)

const isDep = dep => isParallel(dep) || isSerial(dep)

const isTask = task => {
  return task && (typeof task.run === 'function' || Array.isArray(task.deps))
}

/**
 * [a, b, {p: [d, e, {p: [x, y]}]}] becomes
 *
 * ['a', 'b', 'p_1']
 * p_1 : {
 *  deps: ['d', 'e', 'p_2'],
 *  _parallel: true
 * },
 * p_2: {
 *  deps: ['x', 'y'],
 *  _parallel: true
 * }
 */
function standardizeDeps(tasks, task, deps) {
  if (!Array.isArray(deps)) return null
  const result = []
  let name

  if (isSerial(deps)) {
    for (const dep of deps) {
      name = depToRef(tasks, task, dep)
      if (name) {
        result.push(name)
      }
    }
  } else if (isParallel(deps)) {
    name = makeParallelRef(tasks, deps)
    if (name) {
      result.push(name)
    }
  }

  return result.length ? result : null
}

function makeParallelRef(tasks, dep) {
  const name = uniqueName('p')
  const task = {
    name,
    _parallel: true,
  }
  tasks[name] = task
  task.deps = standardizeDeps(tasks, task, dep.p)
  return name
}

function makeAnonymousRef(tasks, fn) {
  if (fn.name) {
    return fn.name
  }

  // anonymous functions need to be in tasks too
  const name = uniqueName('a')
  tasks[name] = {
    name,
    run: fn,
  }

  return name
}

function makeFunctionTask(tasks, fn) {
  if (fn.name) {
    return {
      name: fn.name,
      run: fn,
    }
  }

  // anonymous functions need to be in tasks too
  const name = uniqueName('a')
  return {
    name,
    run: fn,
  }
}

function taskFromRef(tasks, name) {
  return tasks[name]
}

function depToRef(tasks, task, dep) {
  if (!dep) return null

  let name

  if (_.isString(dep)) {
    name = dep
  } else if (typeof dep === 'function') {
    name = makeAnonymousRef(tasks, dep)
  } else if (isParallel(dep)) {
    name = makeParallelRef(tasks, dep)
  } else {
    log.error(`Can't standardize dependency`, {task, dep})
    return null
  }

  if (!tasks[name]) {
    exitError(`Task ${task.name} has invalid ${name} dependency`)
  }
  return name
}

function clearRan(tasks) {
  for (const task of tasks) {
    task._ran = false
  }
}

const taskfileJs = 'Taskfile.js'
const taskfileTs = 'Taskfile.ts'

function findTaskfile(filename) {
  const testFilename = fname => {
    const absolute = fp.join(process.cwd(), fname)
    log.debug(`Trying task file: ${absolute}`)
    return fs.existsSync(absolute) ? absolute : null
  }

  if (filename) {
    return testFilename(filename)
  }

  let fname = testFilename(taskfileJs)
  if (fname) return fname
  fname = testFilename(taskfileTs)
  if (fname) return fname
  return null
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
 *  parallel bool
 *  _ran bool       // whether task ran on current watch change
 * }
 */
async function loadTasks(argv) {
  const taskfilePath = findTaskfile(argv.file)
  if (!taskfilePath) return null

  log.debug(`Loading ${taskfilePath}`)

  const dotext = fp.extname(taskfilePath) || '.js'

  if (argv.typescript || dotext === '.ts') {
    log.trace('Using ts-node for Typescript')

    const tsOptions = {
      compilerOptions: {
        target: 'es2015',
        module: 'commonjs',
      },
    }
    require('ts-node').register(tsOptions)
  } else if (argv.babel) {
    log.trace('Using @babel/preset-env for ES6')
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

  const taskfileExports = require(taskfilePath)
  log.trace('Raw taskfile', taskfileExports)
  const taskfile = standardizeExports(argv, taskfileExports)
  log.trace('Standardized as ES6', taskfile)

  let tasks = {}

  const nonDefault = _.omit(taskfile, 'default')
  if (nonDefault) {
    log.trace('Non-default exports', nonDefault)
    standardizePartial(tasks, nonDefault)
    log.trace('Tasks after standardizing non-defaults', tasks)
  }

  const defaultExport = _.pick(taskfile, 'default')
  if (defaultExport) {
    log.trace('Default export', defaultExport.default)
    standardizePartial(tasks, defaultExport.default)
    log.trace('Tasks afer standardizing default export', tasks)
  }

  // noramlize deps
  for (let name in tasks) {
    const task = tasks[name]
    // deps come in as function variables, convert to name references
    // for depedency resolution
    const deps = standardizeDeps(tasks, task, task.deps)
    task.deps = deps
  }

  // add descriptions needs to be separate task because standardizeDeps
  // can create anonymous tasks for dep only tasks
  // noramlize deps
  for (let name in tasks) {
    const task = tasks[name]
    if (task.desc) continue

    const desc = task.deps
      ? `Run ${task.deps.join(', ')}${task.run ? ', ' + task.name : ''}`
      : task.run ? `Run ${task.name}` : ''
    task.desc = desc
  }

  const all = Object.values(tasks)
  log.trace('Tasks after normalizing deps', tasks)
  return all
}

// standardizes a task file's task. Note for es6 this is called twice:
// 1) non-default exports
// 2) default
//
// mutates task
function standardizePartial(tasks, v) {
  const assignTask = (key, taskdef) => {
    const task = standardizeTask(tasks, key, taskdef)
    if (!task) {
      throw new Error(`Does not resolve to task: ${prettify(taskdef)}`)
    }
    tasks[task.name] = task
  }

  if (_.isObject(v)) {
    // convert exported default object
    for (let name in v) {
      assignTask(name, v[name])
    }
    return
  }

  assignTask('', v)
}

function standardizeTask(tasks, k, v) {
  if (typeof v === 'function') {
    return makeFunctionTask(tasks, v)
  } else if (_.isString(v)) {
    return taskFromRef(tasks, v)
  } else if (isDep(v)) {
    return {
      name: k,
      deps: v,
    }
  } else if (isTask(v)) {
    return Object.assign({}, v, {name: k})
  } else if (_.isObject(v)) {
    throw new Error(
      `Nested object (namespaces) not yet implemented: ${prettify(v)}`
    )
  }

  throw new Error(`Could not convert to task: ${prettify(v)}`)
}

let _nameId = 0
function uniqueName(prefix) {
  _nameId++
  // a=anonymous p=parallel
  return `${prefix}_${_nameId}`
}

module.exports = {clearRan, loadTasks}
