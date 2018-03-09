import {AppContext} from '../core/AppContext'
import {ResolverContext} from './types'
import {safeParseJSON} from '../core/util'
import * as iss from '../core/iss'
import * as runner from '../core/runner'
import * as _ from 'lodash'

export const tasks = (arg: any, ctx: ResolverContext) => {
  return ctx.tasks
}

export const run = async (a: any, ctx: ResolverContext) => {
  interface Param {
    name: string
    argv: string
  }
  const arg = a as Param

  const {context} = ctx
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

  // In the CLI, arbitrary flags become props on argv. From the GUI we need
  // to merge them in.
  //
  // TODO: should the gui start from blank argv? argv currently has all the
  //       all the flags from starting server
  const args = runner.taskParam(context.options, argv)
  const v = await runner.run(context, arg.name, args)

  return {code: 0, payload: JSON.stringify(v)}
}
