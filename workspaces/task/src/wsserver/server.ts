import * as _ from 'lodash'
import * as express from 'express'
import * as fp from 'path'
import * as fs from 'fs'
import * as http from 'http'
import * as WSMessaging from 'ws-messaging'
import {AppContext} from '../core/AppContext'
import {appWorkDirectory} from '../core/util'
import {konsole} from '../core/log'
import {ResolverContext} from './types'
import {Resolvers} from './Resolvers'
import * as WebSocket from 'ws'
import * as url from 'url'

export interface StartOptions {
  port: number
}

const initResolvers = (rcontext: ResolverContext) => {
  return (client: any, authData: any) => {
    const resolverContext = {...rcontext, authData}

    // register any function that does not start with '_'
    const resolvers = new Resolvers(resolverContext)
    for (const k in resolvers) {
      // @ts-ignore
      const resolver = resolvers[k]
      if (k.startsWith('_')) continue
      if (typeof resolver !== 'function') {
        konsole.warn(`resolvers.${k} is not a function , skipping`)
        continue
      }
      client.register(k, resolver)
    }

    return Promise.resolve()
  }
}

export const start = async (ctx: AppContext, opts: StartOptions) => {
  const tasks: Task[] = _.map(ctx.tasks, (task: Task) =>
    _.pick(task, ['deps', 'desc', 'every', 'name', 'once'])
  )

  const rcontext = {
    context: ctx,
    tasks,
  } as ResolverContext

  const app = express()
  const server = http.createServer(app)
  const connectionHook = initResolvers(rcontext)
  const wss = new WSMessaging(
    {server},
    {connectionHook, WebSocketServer: WebSocket.Server}
  )

  server.listen(opts.port, (err: any) => {
    if (err) return konsole.error(err)
    konsole.info(`Running websocket server on http://localhost:${opts.port}`)
  })
}
