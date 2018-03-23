import {konsole} from '#/util'
import {Client} from 'task-ws/client'
import Sockette from 'sockette'

// TODO should be from options
const hostname = '127.0.0.1'
const port = '4200'
const url = `ws://${hostname}:${port}`
const client = new Client()

export const init = () => {
  return new Promise((resolve) => {
    const ws = new Sockette(url, {
      timeout: 5e3,
      maxAttempts: 10,
      onopen: (e) => {
        konsole.log('Connected', e)
        client.init(ws)
        resolve(client)
      },
      onmessage: (e) => client.process(e.data),
      onreconnect: (e) => konsole.log('ws reconnecting...', e),
      onmaximum: (e) => konsole.error('ws stopped after max attempts', e),
      onclose: (e) => konsole.log('ws connection closed', e),
      onerror: (e) => konsole.error('ws error', e),
    })
  })
}

let msgid = 1
export const invoke = (method, ...args) => {
  const id = msgid++
  konsole.debug(`[${id}] Invoking ${method} ...`, args)
  return client
    .invoke(method, ...args)
    .then((res) => {
      konsole.debug(`[${id}] RES`, res)
      return res
    })
    .catch((err) => {
      konsole.error(`[${id}] ERR`, err)
    })
}
