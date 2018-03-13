import _ from 'lodash'
import {init} from '@rematch/core'
import selectorsPlugin from '@rematch/select'
import {taskfiles} from './taskfiles'
import {logs} from './logs'
import {history} from './history'
import {client} from '#/services/websocket'
import {project} from './project'

const models = {history, logs, project, taskfiles}

export const createStore = () => {
  const store = init({
    models,
    plugins: [selectorsPlugin()],
  })

  hookWebSocket(store)
  _.set(window, 'DBG.store', store)
  return store
}

const hookWebSocket = (store) => {
  /*
  proc.stdout.on('data', (data) => {
    client.send('pout', [taskfileId, taskName, proc.pid, data])
  })

  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', (data) => {
    client.send('perr', [taskfileId, taskName, proc.pid, data])
  })

  proc.on('close', () => {
    client.send('pclose', [taskfileId, taskName, proc.pid, code])
  })

  proc.on('error', (err) => {
    client.send('perror', [taskfileId, taskName, proc.pid, err])
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
