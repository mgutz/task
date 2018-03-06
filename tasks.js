const _ = require('lodash')
const {exitError} = require('./exits')
const fp = require('pn/path')
const fs = require('pn/fs')
const log = require('./log')
const {prettify} = require('./util')
const {inspect} = require('util')

// Standardize differences between es6 exports and commonJs exports. Code
// assumes es6 from user taskfiles.
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

const isRunnable = task => {
  return task && (typeof task.run === 'function' || Array.isArray(task.deps))
}

const isTaskMeta = task =>
  task && (task.desc || task.deps || task.every || task.once || task.watch)

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
  if (!isDep(deps)) return null
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
    name = makeParallelRef(tasks, task, deps)
    if (name) {
      result.push(name)
    }
  }

  return result.length ? result : null
}

function makeSeriesRef(tasks, task, deps) {
  const name = uniqueName('s')
  tasks.push({
    name,
    deps,
  })
  return name
}

function makeParallelRef(tasks, task, dep) {
  const name = uniqueName('p')
  const tsk = {
    name,
    _parallel: true,
  }
  tasks[name] = tsk
  // if an array exists in parallel deps then we need to create a series ref
  // to treat it as one unit otherwise each dep runs parallelized
  const deps =
    Array.isArray(dep.p) &&
    dep.p.map(it => {
      if (Array.isArray(it)) {
        return makeSeriesRef(tasks, task, it)
      }
      return it
    })

  tsk.deps = standardizeDeps(tasks, tsk, deps)
  tsk.desc = `Run ${task.name}`
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

function makeFunctionTask(tasks, key, fn) {
  if (fn.name || key) {
    return {
      name: fn.name || key,
      run: fn,
    }
  }
  // anonymous functions need to be in tasks too
  return {
    name: uniqueName('a'),
    run: fn,
  }
}

function depToRef(tasks, task, dep) {
  if (!dep) return null
  let name

  if (_.isString(dep)) {
    name = dep
  } else if (typeof dep === 'function') {
    name = makeAnonymousRef(tasks, dep)
  } else if (isParallel(dep)) {
    name = makeParallelRef(tasks, task, dep)
  } else if (isRunnable(dep)) {
    // reference to an object
    name = _.findKey(tasks, o => o._original == dep)
    if (!name) {
      log.Error(`Can't standardize dependency`, {task, dep})
    }
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

function trace(msg, obj) {
  if (arguments.length === 1) {
    return log.debug(msg)
  }
  log.debug(msg, inspect(obj))
}

/**
 * Loads and standardize tasks.
 *
 * type task struct {
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
  if (!taskfilePath) {
    if (argv.file) {
      return exitError(`Tasks file not found: ${argv.file}`)
    }
    return null
  }
  log.debug(`Loading ${taskfilePath}`)
  const dotext = fp.extname(taskfilePath) || '.js'

  if (argv.typescript || dotext === '.ts') {
    trace('Using ts-node for Typescript')

    const tsOptions = {
      compilerOptions: {
        target: 'es2015',
        module: 'commonjs',
      },
    }
    require('ts-node').register(tsOptions)
  } else if (argv.babel) {
    trace('Using @babel/preset-env for ES6')
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
  trace('Raw taskfile\n', taskfileExports)
  const taskfile = standardizeExports(argv, taskfileExports)
  trace('Standardized as ES6\n', taskfile)

  let tasks = {}

  standardizePartial(tasks, taskfile)
  trace('Tasks after standardizing functions and objects\n', tasks)

  // standardize depdencies
  for (let name in tasks) {
    const task = tasks[name]
    // deps come in as function variables, convert to name references
    // for depedency resolution
    const deps = standardizeDeps(tasks, task, task.deps)
    task.deps = deps
  }

  trace('Tasks after standardizing deps\n', tasks)

  // standardizing deps can create anonymous tasks for dep-only tasks
  for (let name in tasks) {
    const task = tasks[name]
    if (task.desc) continue

    const desc = task.deps
      ? `Run ${task.deps.join(', ')}${task.run ? ', ' + task.name : ''}`
      : task.run ? `Run ${task.name}` : ''
    task.desc = desc
  }

  trace('Tasks after standardizing desc\n', tasks)

  const all = Object.values(tasks)
  trace('Final tasks array\n', all)
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
    return makeFunctionTask(tasks, k, v)
  } else if (isRunnable(v) || isTaskMeta(v)) {
    // do is alias for run, if this is renamed, edit isTaskMeta
    // if (typeof v.do === 'function') {
    //   v.run = v.do
    //   delete v.do
    // }

    // Handle case where second pass augments task in first pass
    //
    // A non-default exported function creates a task in the first pass.
    // In the second pass, a prop in default of the same name augments
    // it with metadata.
    //
    // For example:
    //   // non defaults processed first pass
    //   export async function foo() {}
    //   export async function bar() {}
    //
    //   // foo in default aguments foo with deps
    //   export default { foo: {deps: [bar]}

    // we also need to track original object to compare object references
    const existing = tasks[k]
    return Object.assign({_original: v}, existing, v, {name: k})
  } else {
    throw new Error(
      `Tasks must be a function or task meta: ${prettify({[k]: v})}`
    )
  }
}

let _nameId = 0
function uniqueName(prefix) {
  _nameId++
  // a=anonymous p=parallel
  return `${prefix}_${_nameId}`
}

module.exports = {clearRan, isRunnable, loadTasks}
