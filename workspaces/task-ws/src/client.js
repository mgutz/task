export default class Client {
  constructor() {
    this.callbacks = new Callbacks();
    this.listeners = {};
  }

  setSocket(socket) {
    this.socket = socket;
  }

  emit(event, args, cb) {
    const packet = {n: event};

    if (typeof cb === 'function') {
      packet.i = this.callbacks.register(cb);
    }

    if (args.length) {
      packet.a = args;
    }

    this.socket.send(this.serialize(packet));
  }

  async invoke(method, ...args) {
    return new Promise((resolve, reject) => {
      this.emit('invoke', [method, ...args], obj => {
        const {c: code, e: err, k: stack, p: payload} = obj;

        if (!err) {
          resolve(payload);
        }

        return reject({err, code, stack});
      });
    });
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeListeners(event) {
    if (typeof event === 'undefined') {
      this.listeners = {};
    } else {
      delete this.listeners[event];
    }
  }

  process(message) {
    if (message[0] !== '{') return;

    var parsed = this.deserialize(message);

    // only handle messages intended for us
    if (!parsed.n && !parsed.i) return;
    const {n: event, i: callbackId, e: err, p: payload} = parsed;

    // name or callback id required
    // if (typeof event !== 'string' && typeof callbackId !== 'number') return;

    // message is a callback, so execute it
    if (callbackId) {
      this.callbacks.use(callbackId, parsed);
      return;
    }

    // message is an emitted event, so execute all corresponding listeners
    if (event) {
      if (!this.listeners[event]) return;
      for (var i in this.listeners[event]) {
        this.listeners[event][i](payload);
      }
    }
  }

  serialize(data) {
    return JSON.stringify(data);
  }

  deserialize(data) {
    return JSON.parse(data);
  }
}

class Callbacks {
  constructor() {
    this.callbacks = [];
    this.max = 1;
  }

  register(callback) {
    const id = ++this.max;
    this.callbacks[id] = callback;
    return id;
  }

  use(callbackid, args) {
    this.callbacks[callbackid](args || {});
    delete this.callbacks[callbackid];
  }
}
