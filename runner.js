const _ = require('lodash')
const toposort = require('toposort')
const {ChildProcess} = require('child_process')
const log = require('./log')
const watch = require('./watch')
const {isRunnable, addSeriesRef} = require('./tasks')
const {inspect} = require('util')

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
 *    Consider the parallel case `{p: [b, c]}`, where `b` further depends on `a`.
 *    In that case `[a, b]` and `c` should be run in parallel.
 *     `[a, b]` becomes an anonymous series task in tasks and the original
 *     `b` ref is replaced with `s_1`
 *
 *    The end result `{p: [b, c]}` becomes `{p: [s_1, c]}` where `s_1.deps = [a, b]`
 */
const execGraph = (tasks, processed, taskNames) => {
  let graph = []

  if (!taskNames) return graph

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
    const dependRL = (deps, name) => {
      // this flattens deps, [[a, b], c] => [a, b, c]
      const newDeps = [].concat(deps, name)

      for (let i = newDeps.length - 1; i > 0; i--) {
        const prev = newDeps[i - 1]
        const current = newDeps[i]
        graph.push([prev, current])
      }
    }

    // [[a, b], c], name => [s_1, c, name], where s_1 = {deps: [a, b]}
    const addParallel = (refs, name) => {
      for (let i = 0; i < refs.length; i++) {
        let ref = refs[i]
        // a series in an array necessitates a new unit
        if (Array.isArray(ref)) {
          ref = addSeriesRef(tasks, task, ref)
          refs[i] = ref
        }
        // get sub dependencies of each dependency
        let pdeps = toposort(execGraph(tasks, [], [ref]))

        // if deps has no sub dependencies do nothing
        if (pdeps.length < 2) continue

        // make subdependencies be deps of current parallel task
        // [a, b] name => [s_1, name], where s_1 == [a, b]
        ref = addSeriesRef(tasks, task, pdeps)
        refs[i] = ref
      }
    }

    if (task.deps) {
      if (task._parallel) {
        addParallel(task.deps, name)
      } else {
        dependRL(task.deps, name)
      }
      graph = graph.concat(execGraph(tasks, processed, task.deps))
    }
  }

  log.debug('Dependency graph', inspect(graph))
  return graph
}

/**
 * This does not optimally reduce the order and relies on the task runner
 * to smartly execute tasks which have not yet run. Parallelism introduces
 * complexities that make it difficult to reduce the graph and order. I'm sure
 * it can be done but for now I take advantage of knowing the behaviour of
 * the execution engine.
 */
const execOrder = (tasks, name) => {
  const graph = execGraph(tasks, [], [name])
  graph.push([name, ''])

  const deps = toposort(graph)
  const result = deps.reduce((memo, dep) => {
    if (dep) {
      const task = tasks[dep]
      if (isRunnable(task)) {
        memo.push(dep)
      }
    }
    return memo
  }, [])

  return result
}

const isChildProcess = v => v instanceof ChildProcess
const isPromise = v => v && typeof v.then === 'function'

process.on('SIGINT', function() {
  log.info('cleaning up...')

  for (let name in _childProcesses) {
    const proc = _childProcesses[name]
    if (proc) {
      log.debug(`SIGHUP ${name}`)
      process.kill(-proc.pid, 'SIGHUP')
    }
  }

  process.exit()
})

const _childProcesses = {}
const runTask = async (tasks, task, args, wait = true) => {
  if (didRun(task) && !task.every) {
    log.debug(`SKIP ${task.name} already ran`)
    return
  }
  track(task)

  if (args.argv['dry-run']) {
    if (task._parallel) {
      return log.info(`DRYRUN ${task.name} -> {${task.deps.join(', ')}}`)
    }
    return log.info(`DRYRUN ${task.name}`)
  }
  if (task._parallel) {
    log.debug(`Run parallel ${task.name} -> {${task.deps.join(', ')}}`)
    const promises = task.deps.map(ref => {
      return runTask(tasks, tasks[ref], args, false)
    })
    return Promise.all(promises)
  } else if (Array.isArray(task.deps)) {
    log.debug(`Run series ${task.name} -> [${task.deps.join(', ')}]`)
    for (const ref of task.deps) {
      await runTask(tasks, tasks[ref], args, true)
    }
  }

  const childProcess = _childProcesses[task.name]
  if (childProcess) {
    childProcess.on('close', () => {
      log.debug('Old process closed')
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

  if (typeof task.run !== 'function') return
  log.debug(`RUN ${task.name}...`)

  let v
  if (wait) {
    v = await task.run(args)
    log.debug(`END ${task.name}`)
  } else {
    v = task.run(args)
    if (isPromise(v)) {
      v = v.then(res => {
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
      v.on('error', err => {
        log.info('error occured', err)
        reject(err)
      })
    })
  }

  return v
}

const getTask = (tasks, name) => {
  const task = tasks[name]
  return isRunnable(task) ? task : null
}

const clearTracking = tasks => {
  for (const name in tasks) {
    const task = tasks[name]
    if (task.once) continue
    task._ran = false
  }
}
const track = task => (task._ran = true)
const untrack = task => (task._ran = false)
const didRun = task => task._ran

const run = async (tasks, refs, args) => {
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
    log.debug('Exec order', deps)
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

const runThenWatch = async (tasks, name, args) => {
  const task = getTask(tasks, name)
  if (!(task && Array.isArray(task.watch))) {
    throw new Error(`${name} is not a watchable task.`)
  }

  const globs = task.watch
  let first = true
  await watch(globs, args, async argsWithEvent => {
    clearTracking(tasks)
    if (!first) {
      log.info(`Restarting ${name}`)
    }
    first = false
    await run(tasks, name, argsWithEvent)
  })
}

module.exports = {run, runThenWatch}
