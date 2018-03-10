import * as _ from 'lodash'
import * as Client from 'ws-messaging/client'

// TODO should be from options
const hostname = '127.0.0.1'
const port = '4200'

const url = `ws://${hostname}:${port}`

// authData in connectionHook on server
const authData = {
  token: 'TBD',
}

// @ts-ignore
export const ws = new Client(url, {auth: authData})
ws.on('connect', () => {
  console.log('WS connected')
})

_.set(window, 'DBG.ws', ws)

export const invoke = (method: string, ...args: any[]): Promise<any> => {
  return ws.invoke(method, ...args).catch((err: any) => {
    console.error(`ERR invoking ${method} err=${err} args=`, args)
  })
}

// client.on('someEvent', (...data) => {
//   /* do smth */
// })

// client.register('someMethod', (...args) => {
//   /* do smth, return a promise */
// })

// client.on('connect', () => {
//   /* now this client can send messages */
//   client.send('myEvent', ...someData)
//   /* or use request-reply (RPC) API */
//   client
//     .invoke('myMethod', ...someArgs)
//     .then((result) => {
//       /* do smth */
//     })
//     .catch((error) => {
//       /* do smth */
//     })
// })
