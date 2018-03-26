import * as _ from 'lodash'
import * as findProcess from 'find-process'
import * as fkillit from 'fkill'
import * as fp from 'path'
import * as kill from 'tree-kill'
import * as os from 'os'
import * as util from './util'
import {AppContext} from '../core/AppContext'
import {CodeError} from 'task-ws'
import {loadTasks} from '../core/tasks'
import {parseArgv} from '../cli/usage'
import {Project} from './types'
import {ResolverContext} from './types'
import runAsProcess from './runAsProcess'
import * as globby from 'globby'
/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use (code may be 0 too)
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export const addBookmark = async (
  context: ResolverContext,
  bookmark: History
) => {
  const db = context.projectDB
  const {scope} = bookmark
  if (scope === 'project') {
    if (!db.has('bookmarks').value()) {
      await db.set('bookmarks', []).write()
    }

    return db
      .get('bookmarks')
      .push(bookmark)
      .write()
  }

  throw new CodeError(
    422,
    `Only bookmarks having project scope are saved currently: ${scope}`
  )
}

export const fkill = async (context: ResolverContext, argv: string[]) => {
  return fkillit(argv)
}

/**
 * Loads and sets the project. The project may be reloaded by a
 * browser refresh. The project may only be loaded from a known location for
 * security purposes hence no arguments.
 */
export const loadProject = async (context: ResolverContext) => {
  const argv = context.app.options
  const project = await util.loadProjectFile(argv, true)
  context.project = project

  // make paths relative to home to display in UI but do not alter real paths
  if (Array.isArray(project.taskfiles)) {
    const taskfiles = []
    for (const taskfile of project.taskfiles) {
      taskfiles.push({...taskfile, path: util.relativeToHomeDir(taskfile.path)})
    }
    return {...project, taskfiles}
  }

  return project
}

/**
 * Find process by pid, name or keyword.
 */
export const filterProcesses = async (
  context: ResolverContext,
  kind: string,
  keyword: string
): Promise<any> => {
  const allowed = ['name', 'pid', 'port']
  if (allowed.indexOf(kind) < 0) {
    throw new CodeError(422, 'Invalid process kind')
  }
  if (!keyword) {
    throw new CodeError(422, 'Keyword is required')
  }
  return findProcess(kind, keyword)
}

export const tasks = async (context: ResolverContext, taskfileId: string) => {
  const found = _.find(context.project.taskfiles, {id: taskfileId})
  if (!found) {
    throw new CodeError(
      422,
      `taskfileId '${taskfileId}' not found in project file`
    )
  }
  const argv = parseArgv(found.argv)
  const taskList = await loadTasks(argv, found.path)
  if (!taskList) {
    return []
  }

  // whitelist marshalled properties
  const cleanTasks: Task[] = _.map(taskList, (task: Task) => {
    const tsk = _.pick(task, [
      'deps',
      'desc',
      'every',
      'name',
      'once',
      'ui',
    ]) as any
    // tasks do not have ids since they are just exported functions. create id
    // based on the taskfile id
    tsk.id = taskfileId + '.' + task.name
    return tsk
  })

  return cleanTasks
}

/**
 * Runs a task by name found in taskfile entry from  `Taskproject.json`
 * retrieved by ID. The taskfile entry defines the `Taskfile` path and default
 * args which may be overriden when inbound `argv` is merged.
 *
 * NOTE: Not all args are safe andt the inbound `argv` is sanitized.
 */
export const run = async (
  context: ResolverContext,
  tag: string, // echoed back as-is to client, is currently historyId
  taskfileId: string,
  taskName: string,
  argv: Options
) => {
  const {client, project} = context

  const taskfile = _.find(project.taskfiles, {id: taskfileId})
  if (!taskfile) {
    throw new CodeError(422, `Taskfile id=${taskfileId} not found`)
  }
  const {path, argv: taskfileArgv} = taskfile

  // merge inbound client argv with those found in the project file
  const newArgv = {
    ...parseArgv(taskfileArgv),
    ...util.sanitizeInboundArgv(argv),
    file: fp.resolve(path),
  }

  // this does not wait for process to end, rather it awaits for some async
  // statements like create PID files
  const cp = await runAsProcess({
    argv: newArgv,
    client,
    context,
    tag,
    taskName,
    taskfileId,
  })

  // events are passed through client. return the pid here for the UI
  // to know which pid it is
  return {pid: cp.pid}
}

// TODO we need to verify this is a pid started by task, very dangerous
export const stop = (context: ResolverContext, pid: number) => {
  if (!pid) return `z`
  kill(pid)
}

// (taskfileId)/(taskName)-(timestamp).pid
const rePidfiles = /([^\/]+)\/([^\-]+)-(.+).pid$/
// (taskfileId)/(taskName)-(timestamp).log
const reLogFiles = /([^\/]+)\/([^\-]+)-(.+).log$/

/**
 * Gets list of running process across all taskfiles in project.
 */
export const getRunningProcesses = async (context: ResolverContext) => {
  // const files = await globby(globs)
}

/**
 *
 */
export const tailProcessLogs = () => {
  // TBD
}
