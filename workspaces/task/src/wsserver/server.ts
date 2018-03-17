import * as _ from 'lodash'
import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
// import * as WSMessaging from 'ws-messaging'
import {AppContext} from '../core/AppContext'
import {konsole} from '../core/log'
import {Project, ResolverContext} from './types'
import {Resolvers} from './Resolvers'
import {loadProjectFile} from './util'
import * as lowdb from 'lowdb'
import * as FileAsync from 'lowdb/adapters/FileAsync'
import {Server} from 'task-ws'

export interface StartOptions {
  port: number
}

// const initResolvers = (rcontext: ResolverContext) => {
//   return (client: any, authData: any) => {
//     const resolverContext = {...rcontext, authData, client}

//     // register any function that does not start with '_'
//     const resolvers = new Resolvers(resolverContext)
//     for (const k in resolvers) {
//       // @ts-ignore
//       const resolver = resolvers[k]
//       if (k.startsWith('_') || typeof resolver !== 'function') continue
//       client.register(k, resolver)
//     }

//     return Promise.resolve()
//   }
// }

const initResolvers = (rcontext: ResolverContext) => {
  return (ws: any, authData: any) => {
    const client = new Server(ws)

    konsole.log('Connected')
    const resolverContext = {...rcontext, authData, client}

    // register any function that does not start with '_'
    const resolvers = new Resolvers(resolverContext)
    for (const k in resolvers) {
      // @ts-ignore
      const resolver = resolvers[k]
      if (k.startsWith('_') || typeof resolver !== 'function') continue
      client.register(k, resolver)
    }

    return Promise.resolve()
  }
}

export const start = async (ctx: AppContext, opts: StartOptions) => {
  const project = (await loadProjectFile(ctx.options)) as Project
  const adapter = new FileAsync(project.path)
  const db = await lowdb(adapter)
  const rcontext: any = {
    context: ctx,
    project,
    projectDB: db,
  }
  const app = express()
  const server = http.createServer(app)
  const ws = new WebSocket.Server({server})
  ws.on('connection', initResolvers(rcontext))

  // const wss = new WSMessaging(
  //   {server},
  //   {connectionHook, WebSocketServer: WebSocket.Server}
  // )

  server.listen(opts.port, (err: any) => {
    if (err) return konsole.error(err)
    konsole.info(`Running websocket server on http://localhost:${opts.port}`)
  })
}

// server needs Taskproject.ts
