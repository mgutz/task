import * as _ from 'lodash'
import * as iss from '../core/iss'
import * as runner from '../core/runner'
import {AppContext} from '../core/AppContext'
import {appWorkDirectory, safeParseJSON} from '../core/util'
import {ResolverContext} from './types'
import {shawn} from '../contrib'
import {inspect} from 'util'
import {runAsProcess} from './runAsProcess'

/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export class Resolvers {
  constructor(public rcontext: ResolverContext) {}

  public tasks = (arg: any) => {
    return {c: 200, p: this.rcontext.tasks}
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
