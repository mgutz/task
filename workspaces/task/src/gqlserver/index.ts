import * as resolvers from './resolvers'
import {start} from './server'
import {AppContext} from '../core/AppContext'

const defaults = {
  port: 4200,
  resolvers,
}

export const run = (ctx: AppContext) => {
  start(ctx, defaults)
}
