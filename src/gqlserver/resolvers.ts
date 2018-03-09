import {AppContext} from '../core/AppContext'

export interface ResolverContext {
  context: AppContext
  tasks: Task[]
}

export const tasks = (arg: any, ctx: ResolverContext) => {
  return ctx.tasks
}

export interface RunParams {
  ref: string
}

export const run = ({ref}: RunParams, ctx: ResolverContext) => {
  return {
    code: 0,
    message: '',
    payload: '',
  }
}
