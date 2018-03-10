import * as _ from 'lodash'
import * as iss from '../core/iss'
import * as runner from '../core/runner'
import {AppContext} from '../core/AppContext'
import {appWorkDirectory, safeParseJSON} from '../core/util'
import {ResolverContext} from './types'
import {shawn} from '../contrib'
import {inspect} from 'util'

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

  // In the CLI, arbitrary flags become props on argv. For the GUI we need
  // to merge in user's args.
  const args = {...context.options, ...argv}
  const v = await runner.runAsProcess(arg.name, args as any)

  return {code: 0, payload: 'asda'}
}
