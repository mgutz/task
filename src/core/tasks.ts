import * as _ from 'lodash'
import * as exits from './exits'
import * as fp from 'path'
import * as fs from 'fs'
import log from './log'
import {prettify, trace} from './util'

// Standardize differences between es6 exports and commonJs exports. Code
// assumes es6 from user taskfiles.
function standardizeExports(argv: Options, taskFile: any): any {
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
const isParallel = (dep: any): boolean => dep && Array.isArray(dep.p)

// [dep1, dep2]
const isSerial = (dep: any): boolean => Array.isArray(dep)

const isDep = (dep: any): boolean => isParallel(dep) || isSerial(dep)

export const isRunnable = (task: any): task is Task => {
  return task && (typeof task.run === 'function' || Array.isArray(task.deps))
}

export const runnableRef = (tasks: Tasks, ref: string): string => {
  const task = tasks[ref]
  return isRunnable(task) ? ref : ''
}

const isTaskMeta = (task: any): boolean =>
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
function standardizeDeps(tasks: Tasks, task: Task, deps: any): string[] | null {
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

export function addSeriesRef(tasks: Tasks, task: Task, deps: any[]): string {
  const name = uniqueName('s')
  tasks[name] = {name, deps}
  return name
}

function makeParallelRef(tasks: Tasks, task: Task, dep: any[] | any): string {
  const name = uniqueName('p')
  const tsk: Task = {
    name,
    _parallel: true,
  }
  tasks[name] = tsk
  // if an array exists in parallel deps then we need to create a series ref
  // to treat it as one unit otherwise each dep runs parallelized
  const deps =
    Array.isArray(dep.p) &&
    dep.p.map((it: any): string => {
      if (Array.isArray(it)) {
        return addSeriesRef(tasks, task, it)
      }
      return it
    })

  tsk.deps = standardizeDeps(tasks, tsk, deps) || []
  tsk.desc = `Run ${task.name}`
  return name
}

function makeAnonymousRef(tasks: Tasks, fn: Function): string {
  if (fn.name && tasks[fn.name]) {
    return fn.name
  }

  const name = uniqueName('a')
  tasks[name] = {
    name,
    run: fn,
  } as ReifiedTask
  return name
}

function makeFunctionTask(
  tasks: Tasks,
  key: string,
  fn: Function
): ReifiedTask {
  if (fn.name || key) {
    return {
      name: fn.name || key,
      run: fn,
    } as ReifiedTask
  }
  // anonymous functions need to be in tasks too
  return {
    name: uniqueName('a'),
    run: fn,
  } as ReifiedTask
}

function depToRef(tasks: Tasks, task: Task, dep: any): string | null {
  if (!dep) return null
  let name: string

  if (_.isString(dep)) {
    name = dep
  } else if (typeof dep === 'function') {
    name = makeAnonymousRef(tasks, dep)
  } else if (isParallel(dep)) {
    name = makeParallelRef(tasks, task, dep)
  } else if (isRunnable(dep)) {
    // reference to an object
    const key = _.findKey(tasks, o => o._original == dep)
    if (key) {
      name = key
    } else {
      log.Error(`Can't match object reference`, {task, dep})
      return null
    }
  } else {
    log.error(`Dependency type is not handled`, {task, dep})
    return null
  }

  if (!tasks[name]) {
    exits.error(`Task ${task.name} has invalid ${name} dependency`)
  }
  return name
}

const taskfileJs = 'Taskfile.js'
const taskfileTs = 'Taskfile.ts'

export function findTaskfile(argv: Options): string | null {
  let filename = argv.file
  const testFilename = (fname: string) => {
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
function configureBabel(argv: Options, taskfilePath: string) {
  const dotext = fp.extname(taskfilePath) || '.js'
  const isTypeScript = argv.typescript || dotext === '.ts'

  if (!argv.babel && !isTypeScript) return

  const usingMsg = isTypeScript
    ? 'Using @babel/preset-typescript for TypeScript'
    : 'Using @babel/preset-env for ES6'
  log.debug(usingMsg)

  const extensions = [...argv.babelExtensions]
  if (extensions.indexOf(dotext) === -1) {
    extensions.push(dotext)
  }

  const taskDir = fp.join(__dirname, '..', '..')

  const babelPresetEnvPath = fp.join(
    taskDir,
    'node_modules',
    '@babel',
    'preset-env'
  )
  const babelPresetTypeScriptPath = fp.join(
    taskDir,
    'node_modules',
    '@babel',
    'preset-typescript'
  )
  const babelRegisterPath = fp.join(
    taskDir,
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
export async function loadTasks(
  argv: Options,
  taskfilePath: string
): Promise<Tasks | null> {
  if (!taskfilePath) return null
  configureBabel(argv, taskfilePath)

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
    if (deps) {
      task.deps = deps
    }
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
function standardizeFile(v: any): Tasks {
  const tasks: Tasks = {}
  const assignTask = (key: string, taskdef: any) => {
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

function standardizeTask(tasks: Tasks, k: string, v: any): Task {
  if (typeof v === 'function') {
    return makeFunctionTask(tasks, k, v)
  } else if (isRunnable(v) || isTaskMeta(v)) {
    // we also need to track original object to compare object references
    const existing = tasks[k]
    return {_original: v, ...existing, ...v, name: k}
  } else {
    throw new Error(
      `Tasks must be a function or task object: ${prettify({[k]: v})}`
    )
  }
}

let _nameId = 0
function uniqueName(prefix: string): string {
  _nameId++
  // a=anonymous p=parallel s=serial
  return `${prefix}_${_nameId}`
}
