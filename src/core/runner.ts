import {ChildProcess} from 'child_process'
import * as _ from 'lodash'
import * as toposort from 'toposort'
import {inspect} from 'util'
import * as contrib from '../contrib'
import {addSeriesRef, isRunnable} from './tasks'
import {watch} from './watch'
import {AppContext} from './AppContext'
import {getLogger} from './log'

const isParallelTask = (task: any): task is ParallelTask =>
  task && task._parallel && task.deps

const isSerialTask = (task: any): task is SerialTask =>
  task && Array.isArray(task.deps)

/**
 * A parallel task has shape: {name, _parallel: true, deps: []}
 * A serial task has shape: {name, deps: []}
 *
 *  - `graph.push([a, b])` reads as `a` must run before `b`, in other words
 *    `b` depends on `a`
 *
 *  - This function mutates ref tasks when it encounters a series task within a
 *    parallel task.
 *
 *    Consider the parallel case `{p: [b, c]}`, where `b` further depends on
 *    `a`. In that case `[a, b]` and `c` should be run in parallel.
 *
 *    `[a, b]` becomes an anonymous series task in tasks and the original
 *    `b` ref is replaced with `s_1`
 *
 *    The end result `{p: [b, c]}` becomes `{p: [s_1, c]}` where
 *    `s_1.deps = [a, b]`
 */
const execGraph = (
  tasks: Tasks,
  processed: string[],
  taskNames: string[]
): string[][] => {
  let graph: string[][] = []

  if (!taskNames) {
    return graph
  }

  const log = getLogger()

  for (const name of taskNames) {
    // guard against infinite loop
    if (processed.indexOf(name) > -1) {
      continue
    }
    processed.push(name)

    const task = tasks[name]

    if (!isRunnable(task)) {
      throw new Error(`Name not found: ${name}`)
    }

    // [a, b, c], d => [c, d], [b, c], [a, b]
    const dependRL = (deps: string[], depName: string) => {
      // this flattens deps, [[a, b], c] => [a, b, c]
      const newDeps = [...deps, depName]

      for (let i = newDeps.length - 1; i > 0; i--) {
        const prev = newDeps[i - 1]
        const current = newDeps[i]
        graph.push([prev, current])
      }
    }

    // [[a, b], c], name => [s_1, c, name], where s_1 = {deps: [a, b]}
    const addParallel = (refs: string[]) => {
      for (let i = 0; i < refs.length; i++) {
        let ref = refs[i]
        // a series in an array necessitates a new unit
        if (Array.isArray(ref)) {
          ref = addSeriesRef(tasks, task, ref)
          refs[i] = ref
        }
        // get sub dependencies of each dependency
        const pdeps = toposort(execGraph(tasks, [], [ref]))

        // if deps has no sub dependencies do nothing
        if (pdeps.length < 2) {
          continue
        }

        // make subdependencies be deps of current parallel task
        // [a, b] name => [s_1, name], where s_1 == [a, b]
        ref = addSeriesRef(tasks, task, pdeps)
        refs[i] = ref
      }
    }

    if (task.deps) {
      if (isParallelTask(task)) {
        addParallel(task.deps)
        graph = graph.concat(execGraph(tasks, processed, task.deps))
      } else if (isSerialTask(task.deps)) {
        dependRL(task.deps, name)
        graph = graph.concat(execGraph(tasks, processed, task.deps))
      }
    }
  }

  if (log.level === 'debug') {
    log.debug('Dependency graph', inspect(graph))
  }
  return graph
}

/**
 * This does not optimally reduce the order and relies on the task runner
 * to smartly execute tasks which have not yet run. Parallelism introduces
 * complexities that make it difficult to reduce the graph and order. I'm sure
 * it can be done but for now I take advantage of knowing the behaviour of
 * the execution engine.
 */
const execOrder = (tasks: Tasks, name: string) => {
  const graph = execGraph(tasks, [], [name])
  graph.push([name, ''])
  const deps = toposort(graph)

  const result = []
  for (const dep of deps) {
    if (!dep) {
      continue
    }

    // stop at desired task
    if (dep === name) {
      result.push(dep)
      break
    }

    const task = tasks[dep]
    if (isRunnable(task)) {
      result.push(dep)
    }
  }

  return result
}

const isChildProcess = (v: any): v is ChildProcess =>
  v && typeof v.kill === 'function'

const isPromise = (v: any) => v && typeof v.then === 'function'

process.on('SIGINT', () => {
  const log = getLogger()
  log.info('cleaning up...')

  for (const name in _childProcesses) {
    const proc = _childProcesses[name]
    if (proc) {
      log.debug(`SIGHUP ${name}`)
      process.kill(-proc.pid, 'SIGHUP')
    }
  }

  process.exit()
})

const _childProcesses: {[k: string]: ChildProcess | null} = {}

const runTask = async (
  tasks: Tasks,
  task: Task,
  args: TaskParam,
  wait = true
): Promise<any> => {
  const log = getLogger()

  if (didRun(task) && !task.every) {
    logDryRun(args.argv, `skip ${task.name} ran already`)
    return
  }
  track(task)

  if (isParallelTask(task)) {
    logDryRun(args.argv, `begin ${task.name}: {${task.deps.join(', ')}}`)
    const promises = task.deps.map((ref: string) => {
      return runTask(tasks, tasks[ref], args, false)
    })
    return Promise.all(promises).then(() => {
      logDryRun(args.argv, `end ${task.name}`)
    })
  } else if (Array.isArray(task.deps)) {
    logDryRun(args.argv, `begin ${task.name}: [${task.deps.join(', ')}]`)
    for (const ref of task.deps) {
      await runTask(tasks, tasks[ref], args, true)
    }
    logDryRun(args.argv, `end ${task.name}`)
  }

  const childProcess = _childProcesses[task.name]
  if (childProcess) {
    childProcess.removeAllListeners()
    childProcess.once('close', (code: number) => {
      log.debug(`Task '${task.name}' process exited ${code}`)
      _childProcesses[task.name] = null
      // ensure it is not being tracked so the immediate call to rerun
      // does not think it has already run
      untrack(task)
      setImmediate(() => runTask(tasks, task, args))
    })
    log.debug(`SIGHUP ${task.name}`)
    // regarding -pid, see https://stackoverflow.com/a/33367711
    process.kill(-childProcess.pid, 'SIGHUP')
    return
  }

  if (typeof task.run !== 'function') {
    return
  }

  logDryRun(args.argv, `RUN ${task.name}...`)
  if (args.argv['dry-run']) {
    return
  }

  let v: any
  if (wait) {
    v = await task.run(args)
    log.debug(`END ${task.name}`)
  } else {
    v = task.run(args)
    if (isPromise(v)) {
      v = v.then((res: any) => {
        log.debug(`END ${task.name}`)
        return res
      })
    } else {
      log.debug(`END ${task.name}`)
    }
  }

  if (isChildProcess(v)) {
    log.debug('Tracking old process')
    _childProcesses[task.name] = v
    return new Promise((resolve, reject) => {
      v.once('close', (code: number) => {
        log.debug(`Task '${task.name}' process exited: ${code}`)
        _childProcesses[task.name] = null
        untrack(task)
        resolve({code})
      })
      v.on('error', (err: any) => {
        log.info('error occured', err)
        untrack(task)
        reject(err)
      })
    })
  }

  return v
}

const logDryRun = (argv: Options, msg: string) => {
  const log = getLogger()
  if (argv.dryRun) {
    log.info(msg)
    return
  }
  log.debug(msg)
}

const getTask = (tasks: Tasks, name: string): Task | null => {
  const task = tasks[name]
  return isRunnable(task) ? task : null
}

const clearTracking = (tasks: Tasks) => {
  for (const name in tasks) {
    const task = tasks[name]
    if (task.once) {
      continue
    }
    task._ran = false
  }
}
const track = (task: Task) => (task._ran = true)
const untrack = (task: Task) => (task._ran = false)
const didRun = (task: Task) => task._ran

export const run = async (
  ctx: AppContext,
  refs: string | string[],
  args?: TaskParam
) => {
  const {log, tasks} = ctx

  if (!args) {
    args = taskArgs(ctx.options)
  }

  if (!tasks) {
    throw new Error('`tasks` property is required')
  }
  if (!refs) {
    throw new Error('`refs` is empty')
  }

  if (typeof refs === 'string') {
    refs = [refs]
  }

  for (const name of refs) {
    const deps = execOrder(tasks, name)
    log.debug('Tasks', tasks)
    logDryRun(args.argv, `Exec order [${deps.join(', ')}]`)
    for (const dep of deps) {
      const task = getTask(tasks, dep)
      // tasks can just be deps
      if (task) {
        await runTask(tasks, task, args)
      } else {
        throw new Error('Object is not a task')
      }
    }
  }
}

export const runThenWatch = async (ctx: AppContext, name: string) => {
  const {log, tasks} = ctx
  const args = taskArgs(ctx.options)

  const task = getTask(tasks, name)
  if (!(task && Array.isArray(task.watch))) {
    throw new Error(`${name} is not a watchable task.`)
  }

  const globs = task.watch
  let first = true
  await watch(globs, args, async (argsWithEvent: TaskParam) => {
    clearTracking(tasks)
    if (!first) {
      log.info(`Restarting ${name}`)
    }
    first = false
    await run(ctx, name, argsWithEvent)
  })
}

function taskArgs(argv: Options): TaskParam {
  const sh = require('shelljs')
  const globby = require('globby')
  const prompt = require('inquirer').createPromptModule()

  const execAsync = (...args: any[]) => {
    return new Promise((resolve, reject) => {
      sh.exec(...args, (code: number, stdout: string, stderr: string) => {
        if (code !== 0) {
          return reject({code, stdout, stderr})
        }
        return resolve({code, stdout, stderr})
      })
    })
  }

  return {
    _,
    argv: {...argv, _: argv._.slice(1)}, // drop the command
    contrib,
    exec: execAsync,
    globby,
    prompt,
    sh,
    shawn: contrib.shawn,
  }
}
