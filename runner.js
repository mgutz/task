const _ = require('lodash')
const toposort = require('toposort')
const {ChildProcess} = require('child_process')
const log = require('./log')
const watch = require('./watch')
const {clearRan} = require('./tasks')

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

    if (!isTask(task)) {
      throw new Error(`Name not found: ${name}`)
    }

    if (task.deps) {
      let prev
      for (const dep of task.deps) {
        graph.push([dep, name])
        // in a series, the current task depends on prev
        if (prev) {
          graph.push([prev, dep])
        }
        prev = dep
      }
      graph = graph.concat(execGraph(tasks, processed, task.deps))
    }
    graph.push([name, ''])
  }

  return graph
}

const execOrder = (tasks, name) => {
  const deps = toposort(execGraph(tasks, [], [name]))
  return deps.reduce((memo, dep) => {
    if (dep) {
      const task = _.find(tasks, {name: dep})
      if (task && task.run) {
        memo.push(dep)
      }
    }
    return memo
  }, [])
}

const isTask = task => {
  return task && (typeof task.run === 'function' || Array.isArray(task.deps))
}

const isChildProcess = v => v instanceof ChildProcess
//const isPromise = v => v.then && typeof v.then === 'function'

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
const _ran = {}
const runTask = async (task, args) => {
  if (task.once && _ran[task.name]) {
    log.debug(`SKIP ${task.name} ran once`)
    return
  }

  const childProcess = _childProcesses[task.name]
  if (childProcess) {
    childProcess.on('close', () => {
      _childProcesses[task.name] = null
      setImmediate(() => runTask(task, args))
    })
    log.debug(`SIGHUP ${task.name}`)
    // regarding -pid, see https://stackoverflow.com/a/33367711
    process.kill(-childProcess.pid, 'SIGHUP')
    return
  }

  log.debug(`RUN ${task.name}...`)
  _ran[task.name] = true
  const v = await task.run(args)
  if (isChildProcess(v)) {
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

const getTask = (tasks, name) =>
  _.find(tasks, task => task.name === name && isTask(task))

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
    log.debug('deps order', deps)
    for (const dep of deps) {
      const task = getTask(tasks, dep)
      // tasks can just be deps
      if (task) {
        if (task.run) {
          await runTask(task, args)
        }
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
    clearRan(tasks)
    return await run(tasks, name, argsWithEvent)
  })
}

module.exports = {run, runThenWatch}
