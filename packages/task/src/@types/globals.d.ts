declare module 'columnify'
declare module 'fkill'
declare module 'find-process'
declare module 'require-uncached'
declare module 'toposort'
declare module '@mgutz/task-ws'
declare module 'tree-kill'
declare module '@mgutz/task-tail'
declare module 'is-running'
declare module 'expand-tilde'
declare module 'untabify'
declare module 'rollup-plugin-auto-external'

declare interface Options {
  _: string[]
  babel: boolean
  babelExtensions: string[]
  compile: boolean
  debug: boolean
  dotenv: boolean
  dryRun: boolean
  file: string
  help: boolean
  init: boolean
  initExample: boolean
  list: boolean
  projectFile: string
  server: boolean
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

declare interface UILog {
  ansi?: boolean
  format?: string
}

declare interface TaskUI {
  // form order
  form?: any[]
  // JSON Schema
  schema?: any
  // whether to hide task in UI
  hide?: boolean
  // the initial values for the form
  model?: any
  // mustache template pattern to format log entry if app emits JSON
  log?: UILog
}

declare interface ExecInfo {
  logFile: string
  pid?: string
  tag: string // history id
  taskfileId: string
  taskName: string
  timestamp: string
}

declare interface RawTask {
  deps?: any[]
  desc?: string
  every?: boolean
  name?: string
  once?: boolean
  run?: TaskFunc
  // ui is currenly only used by the UI
  ui?: TaskUI
  watch?: string[]
  _original?: Task
  _ran?: boolean

  _execHistory?: ExecInfo[]
}

declare interface LazyTask extends RawTask {
  lazy: boolean
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
  execa: any
  exec: any
  globby: any
  konsole: any
  prompt: any
  sh: any
  shawn: any
}

declare interface Dict<v> {
  [k: string]: v
}

declare enum HistoryKind {
  Run = 'run',
}

declare enum HistoryScope {
  Project = 'project',
  User = 'user',
}

declare interface History {
  id: string
  kind: HistoryKind
  scope: HistoryScope
  [k: string]: any
}
