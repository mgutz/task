import * as _ from 'lodash'
import * as fp from 'path'
import * as iss from '../core/iss'
import {AppContext} from '../core/AppContext'
import {ResolverContext} from './types'
import {loadProjectFile, runAsProcess} from './util'
import {Project} from './types'
import {parseArgv} from '../cli/usage'
import {loadTasks} from '../core/tasks'
import {parse} from 'querystring'

// general response shape
// {c: numeric_code, e: error_message, p: payload}

/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export class Resolvers {
  constructor(public rcontext: ResolverContext) {}

  public addHistory = async (history: History) => {
    const db = this.rcontext.projectDB
    const {scope} = history
    if (scope === HistoryScope.Project) {
      return db
        .get('histories')
        .push(history)
        .write()
        .then(() => {
          return {c: 200}
        })
    } else {
      return {
        c: 422,
        e: `Only histories having project scope are saved currently: ${scope}`,
      }
    }
  }

  /**
   * Loads and sets the project. The project may be reloaded by a
   * browser refresh. The project may only be loaded from a known location for
   * security purposes hence no arguments.
   */
  public loadProject = async () => {
    const argv = this.rcontext.context.options
    try {
      const project = await loadProjectFile(argv, true)
      this.rcontext.project = project
      return {c: 200, p: project}
    } catch (err) {
      return {c: 500, e: err}
    }
  }

  public tasks = async (taskfileId: string) => {
    const found = _.find(this.rcontext.project.taskfiles, {id: taskfileId})
    if (!found) {
      return {
        c: 422,
        e: `taskfileId '${taskfileId}' not found in project file`,
      }
    }
    const argv = parseArgv(found.argv)
    const tasks = await loadTasks(argv, found.path)
    if (!tasks) {
      return {c: 200, p: []}
    }

    // whitelist marshalled properties
    const cleanTasks: Task[] = _.map(tasks, (task: Task) =>
      _.pick(task, ['deps', 'desc', 'every', 'name', 'once', 'ui'])
    )
    return {c: 200, p: cleanTasks}
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
      return {c: 422, e: `Taskfile id=${taskfileId} not found`}
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
    return {c: 200, p: {pid: cp.pid}}
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

  // const {projectFile, file, server, ...rest} = argv

  // const newArgv = {...rest} as Options
  // console.log('newArgv', newArgv)
  // return newArgv
}
