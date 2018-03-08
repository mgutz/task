import {start} from './server'
import * as resolvers from './resolvers'

const defaults = {
  port: 4200,
  resolvers,
}

export const run = (ctx: AppContext) => {
  start(defaults)
}
