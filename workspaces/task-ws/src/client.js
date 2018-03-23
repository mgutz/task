class Client {
  constructor() {
    this.listeners = {}
  }

  // This must be called prior to using socket. This allows for the callsite
  // to create a reference to an instance of this client before socket
  // connection can be established
  init(socket) {
    this.socket = socket
  }

  emit(event, args, cb) {
    const packet = {n: event}
    if (args.length) {
      packet.a = args
    }
    if (typeof cb === 'function') {
      packet.i = callbacks.register(cb)
    }

    this.socket.send(this.serialize(packet))
  }

  // invoke('remoteMethod', arg1 , arg)
  async invoke(...args) {
    return new Promise((resolve, reject) => {
      this.emit('invoke', args, (obj) => {
        const {c: code, e: err, k: stack, p: payload} = obj

        if (!err) {
          resolve(payload)
        }

        return reject({err, code, stack})
      })
    })
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  removeListeners(event) {
    if (typeof event === 'undefined') {
      this.listeners = {}
    } else {
      delete this.listeners[event]
    }
  }

  process(message) {
    if (message[0] !== '{') return

    const parsed = this.deserialize(message)

    // only handle messages intended for us
    if (!parsed.n && !parsed.i) return
    const {n: event, i: callbackId, p: payload} = parsed

    // name or callback id required
    // if (typeof event !== 'string' && typeof callbackId !== 'number') return;

    // message is a callback, so execute it
    if (callbackId) {
      callbacks.use(callbackId, parsed)
      return
    }

    // message is an emitted event, so execute all corresponding listeners
    if (event) {
      if (!this.listeners[event]) return
      for (var i in this.listeners[event]) {
        this.listeners[event][i](payload)
      }
    }
  }

  serialize(data) {
    return JSON.stringify(data)
  }

  deserialize(data) {
    return JSON.parse(data)
  }
}

const callbacks = {
  funcs: {},
  id: 0,

  register: (fn) => {
    const id = ++callbacks.id
    callbacks.funcs[id] = fn
    return id
  },

  use: (id, args) => {
    callbacks.funcs[id](args || {})
    delete callbacks.funcs[id]
  },
}

module.exports = {Client}
