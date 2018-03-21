import * as _ from 'lodash'
import * as Client from 'ws-messaging/client'
import {konsole, uid} from '#/util'

// TODO should be from options
const hostname = '127.0.0.1'
const port = '4200'
const url = `ws://${hostname}:${port}`

// const client = new Client()

// export const init = () => {
//   return new Promise((resolve) => {
//     const ws = new Sockette(url, {
//       timeout: 5e3,
//       maxAttempts: 10,
//       onopen: (e) => {
//         konsole.log('Connected', e)
//         client.setSocket(ws)
//         resolve(client)
//       },
//       onmessage: (e) => client.process(e.data),
//       onreconnect: (e) => konsole.log('Reconnecting...', e),
//       // onmaximum: (e) => console.log('Stop Attempting!', e),
//       // onclose: (e) => console.log('Closed!', e),
//       // onerror: (e) => console.log('Error:', e),
//     })
//   })
// }

// // @ts-ignore
// //export const client = new Client(url, {auth: authData})

// export const invoke = (method, ...args) => {
//   const msgid = uid()
//   konsole.debug(`[${msgid}] Invoking '${method}':`, args)
//   return client
//     .invoke(method, ...args)
//     .then((res) => {
//       konsole.debug(`[${msgid}] Result`, res)
//       return res
//     })
//     .catch((err) => {
//       konsole.error(`[${msgid}] ERR invoking ${method} err=${err}`)
//     })
// }

// authData in connectionHook on server
const authData = {
  token: 'TBD',
}

// @ts-ignore

let _client

export const init = () => {
  return new Promise((resolve) => {
    _client = new Client(url, {auth: authData})
    _.set(window, 'DBG.ws', _client)
    _client.on('connect', () => {
      resolve(_client)
    })
  })
}

export const invoke = (method, ...args) => {
  const msgid = uid()
  konsole.debug(`[${msgid}] Invoking '${method}':`, args)
  return _client
    .invoke(method, ...args)
    .then((res) => {
      konsole.debug(`[${msgid}] Result`, res)
      return res
      // if (res.c === 200) return res.p
      // throw new Error(res.e)
    })
    .catch((err) => {
      konsole.error(`[${msgid}] ERR invoking ${method} err=${err}`)
    })
}