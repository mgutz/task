import _ from 'lodash'
import {init} from '@rematch/core'
import {tasks} from './tasks'
import {logs} from './logs'
import {history} from './history'
import {client} from '#/services/websocket'

const models = {history, logs, tasks}

export const createStore = () => {
  const store = init({
    models,
  })

  hookWebSocket(store)

  _.set(window, 'DBG.store', store)
  return store
}

const hookWebSocket = (store) => {
  /*
  proc.stdout.on('data', (data) => {
    client.send('pout', [taskName, proc.pid, data])
  })

  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', (data) => {
    client.send('perr', [taskName, proc.pid, data])
  })

  proc.on('close', () => {
    client.send('pclose', [taskName, proc.pid, code])
  })

  proc.on('error', (err) => {
    client.send('perror', [taskName, proc.pid, err])
  })
  */

  // process.stdout event
  client.on('pout', (payload) => {
    store.dispatch({type: 'tasks/pout', payload})
  })

  // process.stderr event
  client.on('perr', (payload) => {
    store.dispatch({type: 'tasks/perr', payload})
  })

  // process error event
  client.on('perror', (payload) => {
    store.dispatch({type: 'tasks/perror', payload})
  })

  // process close event
  client.on('pclose', (payload) => {
    store.dispatch({type: 'tasks/pclose', payload})
  })
}
