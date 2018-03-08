declare module 'columnify'
declare module 'toposort'

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

declare interface AppContext {
  options: Options
  tasks: Tasks
}

declare interface Command {
  run(): void
}

declare interface RunFunc {
  (arg: TaskParam): any
}

declare interface RawTask {
  deps?: any[]
  desc?: string
  every?: boolean
  name?: string
  once?: boolean
  run?: RunFunc
  watch?: string[]
  _original?: Task
  _ran?: boolean
}

declare interface SerialTask extends RawTask {
  deps: string[]
}

declare interface ParallelTask extends RawTask {
  deps: string[]
  _parallel: boolean
}

declare type Task = ParallelTask | SerialTask | RawTask

declare interface Tasks {
  [k: string]: Task
}

declare interface App {
  run(ctx: AppContext): void
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
