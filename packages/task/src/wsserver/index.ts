import {start} from './server'
import {AppContext} from '../core/AppContext'

const defaults = {
  port: 4200,
}

export const run = (ctx: AppContext) => {
  start(ctx, defaults)
}
