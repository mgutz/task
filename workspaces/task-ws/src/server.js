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
    if (typeof o.n === 'undefined') return;

    const {n: event, a: params, i: callbackId} = o;

    let cb;
    if (typeof callbackId !== 'undefined') {
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

  handleRPC(params, cb = noop) {
    const method = params[0];
    const args = params.slice(1);
    const fn = this.rpcMethods[method];
    if (typeof fn === 'function') {
      fn(args, cb);
    }
  }

  register(method, handler) {
    this.rpcMethods[method] = (args, cb) => {
      try {
        const result = args && args.length ? handler(...args) : handler();
        if (isPromise(result)) {
          result.then(
            res => {
              cb(null, res);
            },
            err => {
              cb(err);
            }
          );
        } else {
          cb(null, result);
        }
      } catch (err) {
        cb(err);
      }
    };
  }
}

//util.inherits(Server, events.EventEmitter);
Server.prototype.$emitLocal = EventEmitter.prototype.emit;

const isPromise = o => typeof o.then === 'function';

function noop() {}

module.exports = Server;
