const _ = require('lodash')
const {exitError} = require('./exits')
const fp = require('path')
const fs = require('fs')
const log = require('./log')
const {prettify, trace} = require('./util')

// Standardize differences between es6 exports and commonJs exports. Code
// assumes es6 from user taskfiles.
function standardizeExports(argv, taskFile) {
  if (!argv.babel && typeof taskFile === 'function') {
    return {
      default: taskFile,
      [taskFile.name]: {
        run: taskFile,
        _original: taskFile,
      },
    }
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

const runnableRef = (tasks, ref) => {
  const task = tasks[ref]
  return isRunnable(task) ? ref : ''
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

function addSeriesRef(tasks, task, deps) {
  const name = uniqueName('s')
  tasks[name] = {name, deps}
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
        return addSeriesRef(tasks, task, it)
      }
      return it
    })

  tsk.deps = standardizeDeps(tasks, tsk, deps)
  tsk.desc = `Run ${task.name}`
  return name
}

function makeAnonymousRef(tasks, fn) {
  if (fn.name && tasks[fn.name]) {
    return fn.name
  }

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
      log.Error(`Can't match object reference`, {task, dep})
    }
  } else {
    log.error(`Dependency type is not handled`, {task, dep})
    return null
  }

  if (!tasks[name]) {
    exitError(`Task ${task.name} has invalid ${name} dependency`)
  }
  return name
}

const taskfileJs = 'Taskfile.js'
const taskfileTs = 'Taskfile.ts'

function findTaskfile(argv) {
  let filename = argv.file
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
 * Use task's built-in babel.
 */
function configureBabel(argv, taskfilePath) {
  const dotext = fp.extname(taskfilePath) || '.js'
  const isTypeScript = argv.typescript || dotext === '.ts'

  if (!argv.babel && !isTypeScript) return

  const usingMsg = isTypeScript
    ? 'Using @babel/preset-typescript for TypeScript'
    : 'Using @babel/preset-env for ES6'
  log.debug(usingMsg)

  const extensions = [].concat(argv.babelExtensions)
  if (extensions.indexOf(dotext) === -1) {
    extensions.push(dotext)
  }

  const babelPresetEnvPath = fp.join(
    __dirname,
    'node_modules',
    '@babel',
    'preset-env'
  )
  const babelPresetTypeScriptPath = fp.join(
    __dirname,
    'node_modules',
    '@babel',
    'preset-typescript'
  )
  const babelRegisterPath = fp.join(
    __dirname,
    'node_modules',
    '@babel',
    'register'
  )

  // MUST use full path or babel tries to load @babel/preset-env relative to cwd
  const babelrc = {
    extensions,
    presets: _.compact([
      [babelPresetEnvPath, {targets: {node: 'current'}}],
      isTypeScript ? babelPresetTypeScriptPath : null,
    ]),
  }
  require(babelRegisterPath)(babelrc)
}

/**
 * Use babel inside of user's node project.
 */
// eslint-disable-next-line
function configureUserBabel(argv, taskfilePath) {
  exitError('--babel-local not yet implemented')
}

/**
 * Loads and standardize tasks.
 *
 * type task struct {
 *  deps []string
 *  desc string
 *  every bool
 *  name string
 *  once bool
 *  run function
 *  _parallel bool
 *  _ran bool       // whether task ran on current watch change
 * }
 */
async function loadTasks(argv, taskfilePath) {
  if (!taskfilePath) {
    if (argv.file) {
      return exitError(`Tasks file not found: ${argv.file}`)
    }
    return null
  }

  if (argv.babelLocal) {
    configureUserBabel(argv, taskfilePath)
  } else {
    configureBabel(argv, taskfilePath)
  }

  log.debug(`Loading ${taskfilePath}`)

  const taskfileExports = require(taskfilePath)
  trace('Raw taskfile\n', taskfileExports)
  const taskfile = standardizeExports(argv, taskfileExports)
  trace('Standardized as ES6\n', taskfile)

  const tasks = standardizeFile(taskfile)

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

  return tasks
}

// standardizes a task file's task.
function standardizeFile(v) {
  const tasks = {}
  const assignTask = (key, taskdef) => {
    const task = standardizeTask(tasks, key, taskdef)
    if (!task) {
      throw new Error(`Does not resolve to task: ${prettify(taskdef)}`)
    }
    tasks[key] = task
  }

  if (_.isObject(v)) {
    // convert exported default object
    for (let name in v) {
      assignTask(name, v[name])
    }
    return tasks
  }
  assignTask('', v)
  return tasks
}

function standardizeTask(tasks, k, v) {
  if (typeof v === 'function') {
    return makeFunctionTask(tasks, k, v)
  } else if (isRunnable(v) || isTaskMeta(v)) {
    // we also need to track original object to compare object references
    const existing = tasks[k]
    return Object.assign({_original: v}, existing, v, {name: k})
  } else {
    throw new Error(
      `Tasks must be a function or task object: ${prettify({[k]: v})}`
    )
  }
}

let _nameId = 0
function uniqueName(prefix) {
  _nameId++
  // a=anonymous p=parallel s=serial
  return `${prefix}_${_nameId}`
}

module.exports = {
  isRunnable,
  runnableRef,
  findTaskfile,
  loadTasks,
  addSeriesRef,
}
