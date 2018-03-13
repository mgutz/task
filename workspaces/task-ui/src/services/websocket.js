import * as _ from 'lodash'
import * as Client from 'ws-messaging/client'
import {konsole, uid} from '#/util'

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
  const msgid = uid()
  konsole.debug(`[${msgid}] Invoking '${method}':`, args)
  return client
    .invoke(method, ...args)
    .then((res) => {
      konsole.debug(`[${msgid}] Result`, res)
      if (res.c === 200) return res.p
      throw new Error(res.e)
    })
    .catch((err) => {
      konsole.error(`[${msgid}] ERR invoking ${method} err=${err}`)
    })
}
