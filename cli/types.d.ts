import {ChildProcess, SpawnOptions} from 'child_process'
import * as _ from 'lodash'
import * as sh from 'shelljs'
import * as globby from 'globby'
import {PromptModule} from 'inquirer'

export interface TaskRunArgs {
  _: typeof _
  argv: object // TODO
  contrib: TaskContrib
  exec: ExecAsync
  globby: typeof globby
  prompt: PromptModule
  sh: typeof sh
  shawn: Shawn
}

export type SyncTaskFunction = (args: TaskRunArgs) => void
export type AsyncTaskFunction = (args: TaskRunArgs) => Promise<void>
export type TaskFunction = SyncTaskFunction | AsyncTaskFunction

export interface BaseTaskObject {
  run?: TaskFunction
  deps?: TaskDeps
  watch?: string[]
}
export interface TaskObjectWithRun extends BaseTaskObject {
  run: TaskFunction
}
export interface TaskObjectWithDeps extends BaseTaskObject {
  deps: TaskDeps
}
export type TaskObject = TaskObjectWithRun | TaskObjectWithDeps

export type Task = TaskFunction | TaskObject
export type ParallelTasks = {p: (Task | ParallelTasks)[]}
export type TaskDeps = ParallelTasks | (Task | ParallelTasks)[]

export type Shawn = (script: string, options?: SpawnOptions) => ChildProcess

export interface TaskContrib {
  shawn: Shawn
}

export type ExecAsync = (
  command: string,
  options?: sh.ExecOptions
) => Promise<sh.ExecOutputReturnValue>
