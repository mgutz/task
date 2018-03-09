import * as _ from 'lodash'
import * as exits from './exits'
import * as fp from 'path'
import * as fs from 'fs'
import * as iss from './iss'
import {appWorkDirectory, prettify, trace} from './util'
import {getLogger} from './log'

// Standardize differences between es6 exports and commonJs exports. Code
// assumes es6 from user taskfiles.
const standardizeExports = (argv: Options, taskFile: any): any => {
  if (!argv.babel && typeof taskFile === 'function') {
    return {
      default: taskFile,
      [taskFile.name]: {
        _original: taskFile,
        run: taskFile,
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

export const runnableRef = (tasks: Tasks, ref: string): string => {
  const task = tasks[ref]
  return iss.runnable(task) ? ref : ''
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
const standardizeDeps = (
  tasks: Tasks,
  task: Task,
  deps: any
): string[] | null => {
  if (!isDep(deps)) {
    return null
  }
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

export const addSeriesRef = (tasks: Tasks, task: Task, deps: any[]): string => {
  const name = uniqueName('s')
  tasks[name] = {name, deps}
  return name
}

export const makeParallelRef = (
  tasks: Tasks,
  task: Task,
  dep: any[] | any
): string => {
  const name = uniqueName('p')
  const tsk: Task = {
    _parallel: true,
    name,
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

const makeAnonymousRef = (tasks: Tasks, fn: TaskFunc): string => {
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

const makeFunctionTask = (
  tasks: Tasks,
  key: string,
  fn: TaskFunc
): ReifiedTask => {
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

export const depToRef = (tasks: Tasks, task: Task, dep: any): string | null => {
  const log = getLogger()
  if (!dep) {
    return null
  }
  let name: string

  if (_.isString(dep)) {
    name = dep
  } else if (typeof dep === 'function') {
    name = makeAnonymousRef(tasks, dep)
  } else if (isParallel(dep)) {
    name = makeParallelRef(tasks, task, dep)
  } else if (iss.runnable(dep)) {
    // reference to an object
    const key = _.findKey(tasks, (o: RawTask) => o._original === dep)
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

export const findTaskfile = (argv: Options): string | null => {
  const log = getLogger()
  const filename = argv.file
  const testFilename = (path: string) => {
    const absolute = fp.join(process.cwd(), path)
    log.debug(`Trying task file: ${absolute}`)
    return fs.existsSync(absolute) ? absolute : null
  }

  if (filename) {
    return testFilename(filename)
  }

  let fname = testFilename(taskfileJs)
  if (fname) {
    return fname
  }
  fname = testFilename(taskfileTs)
  if (fname) {
    return fname
  }
  return null
}

/**
 * Use task's built-in babel.
 */
export const configureBabel = (argv: Options, taskfilePath: string) => {
  const dotext = fp.extname(taskfilePath) || '.js'
  const isTypeScript = argv.typescript || dotext === '.ts'

  if (!argv.babel && !isTypeScript) {
    return
  }

  const log = getLogger()

  const usingMsg = isTypeScript
    ? 'Using @babel/preset-typescript for TypeScript'
    : 'Using @babel/preset-env for ES6'
  log.debug(usingMsg)

  const extensions = [...argv.babelExtensions]
  if (extensions.indexOf(dotext) === -1) {
    extensions.push(dotext)
  }

  const babelPresetEnvPath = fp.join(
    appWorkDirectory,
    'node_modules',
    '@babel',
    'preset-env'
  )
  const babelPresetTypeScriptPath = fp.join(
    appWorkDirectory,
    'node_modules',
    '@babel',
    'preset-typescript'
  )
  const babelRegisterPath = fp.join(
    appWorkDirectory,
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
export const loadTasks = async (
  argv: Options,
  taskfilePath: string
): Promise<Tasks | null> => {
  if (!taskfilePath) {
    return null
  }
  configureBabel(argv, taskfilePath)

  const log = getLogger()
  log.debug(`Loading ${taskfilePath}`)

  const taskfileExports = require(taskfilePath)
  trace('Raw taskfile\n', taskfileExports)
  const taskfile = standardizeExports(argv, taskfileExports)
  trace('Standardized as ES6\n', taskfile)

  const tasks = standardizeFile(taskfile)

  trace('Tasks after standardizing functions and objects\n', tasks)

  // standardize dependencies
  // tslint:disable-next-line
  for (const name in tasks) {
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
  // tslint:disable-next-line
  for (const name in tasks) {
    const task = tasks[name]
    if (task.desc) {
      continue
    }

    const desc = task.deps
      ? `Run ${task.deps.join(', ')}${task.run ? ', ' + task.name : ''}`
      : task.run ? `Run ${task.name}` : ''
    task.desc = desc
  }

  trace('Tasks after standardizing desc\n', tasks)

  return tasks
}

// standardizes a task file's task.
export const standardizeFile = (v: any): Tasks => {
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
    // tslint:disable-next-line
    for (const name in v) {
      assignTask(name, v[name])
    }
    return tasks
  }
  assignTask('', v)
  return tasks
}

export const standardizeTask = (tasks: Tasks, k: string, v: any): Task => {
  if (typeof v === 'function') {
    return makeFunctionTask(tasks, k, v)
  } else if (iss.runnable(v) || isTaskMeta(v)) {
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
const uniqueName = (prefix: string): string => {
  _nameId++
  // a=anonymous p=parallel s=serial
  return `${prefix}_${_nameId}`
}
