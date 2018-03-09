import * as resolvers from './resolvers'
import {start} from './server'

const defaults = {
  port: 4200,
  resolvers,
}

export const run = (ctx: AppContext) => {
  start(defaults)
}
