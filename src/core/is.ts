import {ChildProcess} from 'child_process'

export const parallelTask = (task: any): task is ParallelTask =>
  task && task._parallel && task.deps

export const serialTask = (task: any): task is SerialTask =>
  task && Array.isArray(task.deps)

export const childProcess = (v: any): v is ChildProcess =>
  v && typeof v.kill === 'function'

export const promise = (v: any) => v && typeof v.then === 'function'

export const runnable = (task: any): task is Task => {
  return task && (typeof task.run === 'function' || Array.isArray(task.deps))
}

// {p: [dep1, dep2]}
// const isParallel = (dep: any): boolean => dep && Array.isArray(dep.p)
