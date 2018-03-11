import * as _ from 'lodash'
import * as Client from 'ws-messaging/client'
import {konsole} from '#/util'

// TODO should be from options
const hostname = '127.0.0.1'
const port = '4200'

const url = `ws://${hostname}:${port}`

// authData in connectionHook on server
const authData = {
  token: 'TBD',
}

// @ts-ignore
export const client = new Client(url, {auth: authData})

_.set(window, 'DBG.ws', client)

export const invoke = (method, ...args) => {
  konsole.log(`Invoking method:`, method, args)
  return client
    .invoke(method, ...args)
    .then((res) => {
      konsole.log('RESULT', res)
      if (res.c === 200) return res.p
      throw new Error(res.e)
    })
    .catch((err) => {
      konsole.error(`ERR invoking ${method} err=${err}`)
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
