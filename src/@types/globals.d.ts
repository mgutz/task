declare interface Options {
  _: string[]
  babelExtensions: string[]
  debug: boolean
  dryRun: boolean
  file: string
  gui: boolean
  init: boolean
  initExample: boolean
  list: boolean
  babel: boolean
  dotenv: boolean
  silent: boolean
  trace: boolean
  typescript: boolean
  watch: boolean
  help: boolean
}

declare interface AppContext {
  options: Options
  tasks: Tasks
}

declare interface Command {
  run(): void
}

declare interface Task {
  desc?: string
  deps?: any[]
  every?: boolean
  once?: boolean
  name?: string
  run?: Function
  watch?: string[]
  _original?: Task
  _parallel?: boolean
  _ran?: boolean
}

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
