import * as _ from 'lodash'
import * as fp from 'path'
import * as os from 'os'
import {AppContext} from '../core/AppContext'
import {ResolverContext} from './types'
import {loadProjectFile, runAsProcess} from './util'
import {Project} from './types'
import {parseArgv} from '../cli/usage'
import {loadTasks} from '../core/tasks'
import {CodeError} from 'task-ws'
import * as kill from 'tree-kill'
import * as fkillit from 'fkill'
import * as findProcess from 'find-process'

/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use (code may be 0 too)
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export class Resolvers {
  constructor(public rcontext: ResolverContext) {}

  public addBookmark = async (bookmark: History) => {
    const db = this.rcontext.projectDB
    const {scope} = bookmark
    if (scope === 'project') {
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

  public fkill = async (argv: string[]) => {
    return fkillit(argv)
  }

  /**
   * Loads and sets the project. The project may be reloaded by a
   * browser refresh. The project may only be loaded from a known location for
   * security purposes hence no arguments.
   */
  public loadProject = async () => {
    const argv = this.rcontext.context.options
    const project = await loadProjectFile(argv, true)
    this.rcontext.project = project

    // make paths relative to home to display in UI but do not alter real paths
    if (Array.isArray(project.taskfiles)) {
      const taskfiles = []
      for (const taskfile of project.taskfiles) {
        taskfiles.push({...taskfile, path: relativeToHomeDir(taskfile.path)})
      }
      return {...project, taskfiles}
    }

    return project
  }

  /**
   * Find process by pid, name or keyword.
   */
  public filterProcesses = async (
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

  public tasks = async (taskfileId: string) => {
    const found = _.find(this.rcontext.project.taskfiles, {id: taskfileId})
    if (!found) {
      throw new CodeError(
        422,
        `taskfileId '${taskfileId}' not found in project file`
      )
    }
    const argv = parseArgv(found.argv)
    const tasks = await loadTasks(argv, found.path)
    if (!tasks) {
      return []
    }

    // whitelist marshalled properties
    const cleanTasks: Task[] = _.map(tasks, (task: Task) =>
      _.pick(task, ['deps', 'desc', 'every', 'name', 'once', 'ui'])
    )
    return cleanTasks
  }

  /**
   * Runs a task by name found in taskfile entry from  `Taskproject.json`
   * retrieved by ID. The taskfile entry defines the `Taskfile` path and default
   * args which may be overriden when inbound `argv` is merged.
   *
   * NOTE: Not all args are safe andt the inbound `argv` is sanitized.
   */
  public run = (
    tag: string, // echoed back as-is to client, is currently historyId
    taskfileId: string,
    taskName: string,
    argv: Options
  ) => {
    const {context, client, project} = this.rcontext

    const taskfile = _.find(project.taskfiles, {id: taskfileId})
    if (!taskfile) {
      throw new CodeError(422, `Taskfile id=${taskfileId} not found`)
    }
    const {path, argv: taskfileArgv} = taskfile

    // merge inbound client argv with those found in the project file
    const newArgv = {
      ...parseArgv(taskfileArgv),
      ...sanitizeInboundArgv(argv),
      file: fp.resolve(path),
    }

    const cp = runAsProcess(tag, taskfileId, taskName, newArgv, client)

    // events are passed through client. return the pid here for the UI
    // to know which pid it is
    return {pid: cp.pid}
  }

  // TODO we need to verify this is a pid started by task, very dangerous
  public stop = (pid: number) => {
    if (!pid) return `z`
    kill(pid)
  }
}

/**
 * The client MUST NOT be allowed to override taskfile and projectfile.
 * @param argv Users
 */
const sanitizeInboundArgv = (argv: Options): Options => {
  if (_.isEmpty(argv)) return {} as Options

  // TODO task options need to be separate from CLI options
  //
  // In this example: task foo --help -- --help
  //   foo is the task to run
  //   --help is argument to CLI
  //   -- help is argument to the task to run
  return _.omit(argv, [
    '_',
    'file',
    'help',
    'server',
    'init',
    'initExample',
    'list',
    'projectFile',
  ]) as Options
}

const relativeToHomeDir = (path: string): string =>
  fp.join('~', fp.relative(os.homedir(), fp.resolve(path)))
