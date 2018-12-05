import * as iss from './iss'
import * as toposort from 'toposort'
import {getLogger} from './log'
import {inspect} from 'util'
import {addSeriesRef} from './tasks'

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
const dependencyGraph = (
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

    if (!iss.runnable(task)) {
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
        const pdeps = toposort(dependencyGraph(tasks, [], [ref]))

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
      if (iss.parallelTask(task)) {
        addParallel(task.deps)
        graph = graph.concat(dependencyGraph(tasks, processed, task.deps))
      } else if (iss.serialTask(task.deps)) {
        dependRL(task.deps, name)
        graph = graph.concat(dependencyGraph(tasks, processed, task.deps))
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
export const execOrder = (tasks: Tasks, name: string) => {
  const graph = dependencyGraph(tasks, [], [name])
  graph.push([name, ''])

  // if _before lifecycle hooks than make it a hard dependency of the task
  if (tasks._before) {
    graph.push(['_before', name])
  }

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
    if (iss.runnable(task)) {
      result.push(dep)
    }
  }
  return result
}
