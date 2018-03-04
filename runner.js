const _ = require('lodash')
const toposort = require('toposort')
const {ChildProcess} = require('child_process')
const log = require('./log')
const watch = require('./watch')
const {isRunnable} = require('./tasks')

// Very simple depdendency resolution. Will execute dependencies once.
const execGraph = (tasks, processed, taskNames) => {
  let graph = []

  if (!taskNames) return graph

  for (const name of taskNames) {
    // guard against infinite loop
    if (processed.indexOf(name) > -1) {
      continue
    }
    processed.push(name)

    const task = _.find(tasks, {name})

    if (!isRunnable(task)) {
      throw new Error(`Name not found: ${name}`)
    }

    if (task.deps) {
      if (task._parallel) {
        // do nothing
      } else {
        let prev
        for (const dep of task.deps) {
          if (task._parallel) {
            continue
          }
          graph.push([dep, name])
          // in a series, the current task depends on prev
          if (prev) {
            graph.push([prev, dep])
          }
          prev = dep
        }
      }
      graph = graph.concat(execGraph(tasks, processed, task.deps))
    }
    graph.push([name, ''])
  }

  return graph
}

const execOrder = (tasks, name) => {
  const deps = toposort(execGraph(tasks, [], [name]))
  const result = deps.reduce((memo, dep) => {
    if (dep) {
      const task = _.find(tasks, {name: dep})
      if (isRunnable(task)) {
        memo.push(dep)
      }
    }
    return memo
  }, [])

  return result

  // truncate deps at the task being run
  // const idx = result.indexOf(name)
  // if (idx < 0) throw new Error(`{Task ${name} was not in exec order`)
  // return result.slice(0, idx + 1)
}

const isChildProcess = v => v instanceof ChildProcess
const isPromise = v => typeof v.then === 'function'

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
    log.debug(`Run ${task.name} -> {${task.deps.join(', ')}}`)
    const promises = task.deps.map(name => {
      const task = getTask(tasks, name)
      return runTask(tasks, task, args, false)
    })
    return await Promise.all(promises)
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
      v.then(res => {
        log.debug(`END ${task.name}`)
        return res
      })
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

const getTask = (tasks, name) => _.find(tasks, task => task.name === name && isRunnable(task))

const clearTracking = tasksArr => {
  for (let task of tasksArr) {
    if (task.once) continue
    task._ran = false
  }
}
const track = task => (task._ran = true)
const untrack = task => (task._ran = false)
const didRun = task => task._ran

const run = async (tasks, names, args) => {
  if (!tasks) {
    throw new Error('`tasks` property is required')
  }
  if (!tasks.length) {
    throw new Error('`tasks` is empty')
  }
  if (!names) {
    throw new Error('`names` is empty')
  }

  if (typeof names === 'string') {
    names = [names]
  }

  for (const name of names) {
    const deps = execOrder(tasks, name)
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
  await watch(globs, args, async argsWithEvent => {
    clearTracking(tasks)
    await run(tasks, name, argsWithEvent)
  })
}

module.exports = {run, runThenWatch}
