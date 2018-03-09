declare module 'columnify'
declare module 'toposort'
declare module 'tiny-worker'

declare interface Options {
  _: string[]
  babel: boolean
  babelExtensions: string[]
  debug: boolean
  dotenv: boolean
  dryRun: boolean
  file: string
  gui: boolean
  help: boolean
  init: boolean
  initExample: boolean
  list: boolean
  silent: boolean
  trace: boolean
  typescript: boolean
  watch: boolean
}

declare type TaskFunc = (arg: TaskParam) => any

declare type ResolverFunc = (...v: any[]) => void

declare interface TaskResult {
  name: string
  result: any
}

declare interface RawTask {
  deps?: any[]
  desc?: string
  every?: boolean
  name?: string
  once?: boolean
  run?: TaskFunc
  watch?: string[]
  _original?: Task
  _ran?: boolean
}

declare interface SerialTask extends RawTask {
  name: string
  deps: string[]
}

declare interface ParallelTask extends RawTask {
  name: string
  deps: string[]
  _parallel: boolean
}

declare interface ReifiedTask extends RawTask {
  name: string
  deps?: string[]
}

declare type Task = ParallelTask | SerialTask | ReifiedTask

declare interface Tasks {
  [k: string]: Task
}

/**
 * TaskParam is the single param passed when invoking a Task.
 */
declare interface TaskParam {
  _: any
  argv: any
  contrib: any
  event?: any
  exec: any
  globby: any
  prompt: any
  sh: any
  shawn: any
}
