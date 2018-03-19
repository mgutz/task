const {EventEmitter} = require('events');
const util = require('util');

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
  constructor(connection) {
    super();
    this.conn = connection;
    connection.on('message', data => {
      this.process(data);
    });

    this.rpcMethods = {};
    this.handleRPC = this.handleRPC.bind(this);
    this.on('invoke', this.handleRPC);
  }

  emit(event, payload) {
    if (event === 'newListener') {
      return this.$emitLocal(event, ...args);
    }
    const message = this.serialize({n: event, p: payload});
    return this.conn.send(message);
  }

  serialize(data) {
    return JSON.stringify(data);
  }

  process(message) {
    if (message[0] !== '{') return;

    // {n: 'event', a: 'args', i?: 'callbackid'}
    // {c: statusCode, e: 'error', p: 'payload', 'i': callbackid}
    const o = JSON.parse(message);
    if (!o.n) return;

    const {n: event, a: params, i: callbackId} = o;

    let cb;
    if (callbackId) {
      const conn = this.conn;
      const serialize = this.serialize;
      cb = (err, data) => {
        if (err) {
          const packet = {e: err.message, i: callbackId};
          packet.c = typeof err.code !== 'undefined' ? err.code : 500;

          if (typeof err.stack !== 'undefined') {
            packet.k = err.stack;
          }
          return conn.send(serialize(packet));
        }
        return conn.send(serialize({c: 0, i: callbackId, p: data}));
      };
    }

    this.$emitLocal(event, params, cb);
  }

  handleRPC(params, cb) {
    const method = params[0];
    const args = params.slice(1);
    const fn = this.rpcMethods[method];
    if (typeof fn === 'function') {
      return fn(args, cb);
    }
    console.error('Remote method not found: ' + method);
  }

  register(method, handler) {
    this.rpcMethods[method] = (args, cb) => {
      try {
        const result = args && args.length ? handler(...args) : handler();

        // ensure errors are logged, forwarded with or without callback
        if (isPromise(result)) {
          if (cb) {
            return result.then(res => cb(null, res), cb);
          }
          return result.catch(err => {
            console.error(noCallbackMessage, err);
          });
        } else {
          if (cb) cb(null, result);
        }
      } catch (err) {
        if (cb) return cb(err);
        console.error(noCallbackMessage, err);
      }
    };
  }
}

const noCallbackMessage = 'There is no callback and error occured while executing a registered method.';

//util.inherits(Server, events.EventEmitter);
Server.prototype.$emitLocal = EventEmitter.prototype.emit;

const isPromise = o => typeof o.then === 'function';

function noop() {}

module.exports = Server;
