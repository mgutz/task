import * as _ from 'lodash'
import * as iss from '../core/iss'
import {AppContext} from '../core/AppContext'
import {ResolverContext} from './types'
import {loadProjectFile, runAsProcess} from './util'
import {Project} from './types'
import {parseArgv} from '../cli/usage'
import {loadTasks} from '../core/tasks'

/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export class Resolvers {
  constructor(public rcontext: ResolverContext) {}

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

  public tasks = async (taskfileID: string) => {
    const found = _.find(this.rcontext.project.taskfiles, {id: taskfileID})
    if (!found) {
      return {
        c: 422,
        e: `taskfileID '${taskfileID}' not found in project file`,
      }
    }
    const argv = parseArgv(found.argv)
    const tasks = await loadTasks(argv, found.path)
    if (!tasks) {
      return {c: 200, p: []}
    }

    // whitelist marshalled properties
    const cleanTasks: Task[] = _.map(tasks, (task: Task) =>
      _.pick(task, ['deps', 'desc', 'every', 'form', 'name', 'once'])
    )
    return {c: 200, p: cleanTasks}
  }

  // {c: numeric_code, e: error_message, p: payload}
  public run = (name: string, argv: Dict<string, any>) => {
    const {context, client} = this.rcontext
    const task = context.tasks[name]
    if (!task) return {c: 422, e: 'Task not found'}
    if (!iss.runnable(task)) {
      return {c: 422, e: 'Task is not runnable'}
    }

    // In the CLI, arbitrary flags become props on argv. For the GUI we need
    // to merge in user's args.
    const args = {...context.options, ...argv}
    const cp = runAsProcess(name, args as any, client)

    // events are passed through client. return the pid here for the UI
    // to know which pid it is
    return {c: 200, p: {pid: cp.pid}}
  }
}
