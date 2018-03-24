/* eslint-disable no-console */
const {EventEmitter} = require('events')
const stream = require('stream')

const _connections = new Set()

/*
  {
    n: string     // event name
    p: any        // payload
    k: string     // stack
    c: number     // status code HTTPS statuses, 0 also means no error
    i: number     // callback id
    a: any[]      // arguments to method
*/
class Server extends EventEmitter {
  constructor(connection, context, rpcRegistry) {
    super()

    this.conn = connection
    connection.on('message', (data) => {
      this.process(data)
    })

    this.handleRPC = this.handleRPC.bind(this)

    this.rpcRegistry = rpcRegistry
    this.on('invoke', this.handleRPC)
    this.context = Object.assign({}, context, {client: this})
    this.writable = new stream.Writable()
  }

  emit(event, payload) {
    if (event === 'newListener') {
      return this.$emitLocal(event, ...payload)
    }
    const message = this.serialize({n: event, p: payload})
    this._send(message)
  }

  serialize(data) {
    return JSON.stringify(data)
  }

  // {n: 'event', a: 'args', i?: 'callbackid'}
  // returns {c: statusCode, e: 'error', p: 'payload',  i?: callbackid}
  process(message) {
    if (message[0] !== '{') return

    try {
      const o = JSON.parse(message)
      if (!o.n) return

      const {n: event, a: params, i: callbackId} = o

      let cb
      if (callbackId) {
        cb = (err, data) => {
          if (err) {
            const packet = {e: err.message, i: callbackId}
            packet.c = typeof err.code !== 'undefined' ? err.code : 500

            if (typeof err.stack !== 'undefined') {
              packet.k = err.stack
            }
            return this._send(this.serialize(packet))
          }
          return this._send(this.serialize({c: 0, i: callbackId, p: data}))
        }
      }

      this.$emitLocal(event, params, cb)
    } catch (err) {
      console.error('Error while processing packet', message)
      console.error(err)
      return
    }
  }

  handleRPC(params, cb) {
    const method = params[0]
    const args = params.slice(1)

    // handlers may be namespaced
    let fn = this.rpcRegistry.get(method)
    if (fn) {
      return fn(this.context, args, cb)
    }
    console.error('Remote method not registered', method)
  }

  _send(data) {
    for (const conn of _connections) {
      // 1 === OPEN
      if (conn.readyState !== 1) {
        continue
      }
      conn.send(data)
    }
  }
}

Server.prototype.$emitLocal = EventEmitter.prototype.emit

function noop() {}

// https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
const initMessaging = (wss, hook) => {
  function heartbeat() {
    this.isAlive = true
  }

  wss.on('connection', function connection(ws) {
    //console.log('adding connection');
    _connections.add(ws)
    ws.isAlive = true
    ws.on('pong', heartbeat)
    ws.on('close', function connection(ws) {
      //console.log('deleting connection');
      _connections.delete(ws)
    })

    hook(ws)
  })

  setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        //console.log('terminating connection');
        _connections.delete(ws)
        return ws.terminate()
      }
      ws.isAlive = false
      ws.ping(noop)
    })
  }, 30000)
}

module.exports = {Server, initMessaging}
