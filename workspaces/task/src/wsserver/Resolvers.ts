import * as _ from 'lodash'
import * as iss from '../core/iss'
import * as runner from '../core/runner'
import {AppContext} from '../core/AppContext'
import {appWorkDirectory, safeParseJSON} from '../core/util'
import {ResolverContext} from './types'
import {shawn} from '../contrib'
import {inspect} from 'util'

/**
 * Resolvers (handlers) for websocket API
 *
 * Error codes must use
 * [HTTP status codes](http://www.restapitutorial.com/httpstatuscodes.html).
 */
export class Resolvers {
  constructor(public rcontext: ResolverContext) {}

  public tasks = (arg: any) => {
    return this.rcontext.tasks
  }

  public run = async (a: any) => {
    interface Param {
      name: string
      argv: string
    }
    const arg = a as Param

    const {context} = this.rcontext
    const task = context.tasks[arg.name]
    if (!task) return {code: 422, message: 'Task not found'}
    if (!iss.runnable(task)) {
      return {code: 422, message: 'Task is not runnable'}
    }

    const [argv, err] = safeParseJSON(arg.argv)
    if (err) {
      return {
        code: 422,
        message: err,
      }
    }

    // In the CLI, arbitrary flags become props on argv. For the GUI we need
    // to merge in user's args.
    const args = {...context.options, ...argv}
    const v = await runner.runAsProcess(arg.name, args as any)

    return {code: 200, payload: 'asda'}
  }
}
