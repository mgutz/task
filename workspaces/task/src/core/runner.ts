import * as _ from 'lodash'
import * as iss from './iss'
import {AppContext} from './AppContext'
import {ChildProcess} from 'child_process'
import {execOrder} from './depsGraph'
import {getLogger} from './log'
import {watch} from './watch'
import {taskParam} from './util'

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

  if (iss.parallelTask(task)) {
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
    if (iss.promise(v)) {
      v = v.then((res: any) => {
        log.debug(`END ${task.name}`)
        return res
      })
    } else {
      log.debug(`END ${task.name}`)
    }
  }

  if (iss.childProcess(v)) {
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
  return iss.runnable(task) ? task : null
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

export const run = async (ctx: AppContext, name: string, args?: TaskParam) => {
  const {log, tasks} = ctx

  if (!args) {
    args = taskParam(ctx.options)
  }

  if (!tasks) {
    throw new Error('`tasks` property is required')
  }
  if (!name || !_.isString(name)) {
    throw new Error('`name` is blank or not a string')
  }

  const deps = execOrder(tasks, name)
  log.debug('Tasks', tasks)
  logDryRun(args.argv, `Exec order [${deps.join(', ')}]`)
  const results: TaskResult[] = []
  for (const dep of deps) {
    const task = getTask(tasks, dep)
    // tasks can just be deps
    if (task) {
      const result = await runTask(tasks, task, args)
      results.push({name: task.name, result})
    } else {
      throw new Error('Object is not a task')
    }
  }

  return results
}

export const runThenWatch = async (ctx: AppContext, name: string) => {
  const {log, tasks} = ctx
  const args = taskParam(ctx.options)

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
