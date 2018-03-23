import * as _ from 'lodash'
import * as express from 'express'
import * as http from 'http'
import * as WebSocket from 'ws'
import {AppContext} from '../core/AppContext'
import {konsole} from '../core/log'
import {Project, ResolverContext} from './types'
import * as taskHandlers from './taskHandlers'
import {loadProjectFile} from './util'
import * as lowdb from 'lowdb'
import * as FileAsync from 'lowdb/adapters/FileAsync'
import {Server, initMessaging, RPCRegistry} from 'task-ws'
import * as WSMessaging from 'ws-messaging'

export interface StartOptions {
  port: number
}

interface HandlersDict {
  [k: string]: (context: ResolverContext, ...args: any[]) => Promise<any>
}

const onConnection = (rcontext: ResolverContext) => {
  const registry = new RPCRegistry()
  registry.register('task', taskHandlers)

  // only this function is called on connection, handlers above initialize once
  return (socket: any) => {
    konsole.log('Connected')
    return new Server(socket, rcontext, registry)
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

  const wss = new WebSocket.Server({server})
  initMessaging(wss, onConnection(rcontext))

  server.listen(opts.port, (err: any) => {
    if (err) return konsole.error(err)
    konsole.info(`Running websocket server on http://localhost:${opts.port}`)
  })
}
