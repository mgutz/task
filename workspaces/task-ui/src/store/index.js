import _ from 'lodash'
import {init} from '@rematch/core'
import selectorsPlugin from '@rematch/select'
import {taskfiles} from './taskfiles'
import {logs} from './logs'
import {histories} from './histories'
import {init as initWebSocketClient} from '#/services/websocket'
import {project} from './project'
import {initRouter5} from './router'
import {api} from './api'
import routes from '#/routes'
import {trace} from './middleware/trace'

export const createStore = async () => {
  const router = await initRouter5(routes)
  const models = {api, histories, logs, project, router, taskfiles}

  const store = init({
    models,
    plugins: [selectorsPlugin()],
    redux: {
      middlewares: [trace],
    },
  })

  const wsClient = await initWebSocketClient()

  hookWebSocket(store, wsClient)
  _.set(window, 'DBG.store', store)
  return store
}

const hookWebSocket = (store, client) => {
  /*
  proc.stdout.on('data', (data) => {
    client.send('pout', [taskfileId, taskName, tag, proc.pid, data])
  })

  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', (data) => {
    client.send('perr', [taskfileId, taskName, tag, proc.pid, data])
  })

  proc.on('close', () => {
    client.send('pclose', [taskfileId, taskName, tag, proc.pid, code])
  })

  proc.on('error', (err) => {
    client.send('perror', [taskfileId, taskName, tag, proc.pid, err])
  })
  */

  // process.stdout event
  client.on('pout', (payload) => {
    store.dispatch({type: 'taskfiles/pout', payload})
  })

  // process.stderr event
  client.on('perr', (payload) => {
    store.dispatch({type: 'taskfiles/perr', payload})
  })

  // process error event
  client.on('perror', (payload) => {
    store.dispatch({type: 'taskfiles/perror', payload})
  })

  // process close event
  client.on('pclose', (payload) => {
    store.dispatch({type: 'taskfiles/pclose', payload})
  })
}
