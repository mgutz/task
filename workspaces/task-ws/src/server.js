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

const noCallbackMessage = 'There is no callback and error occured while executing a registered method.';

const _connections = new Set();

const isPromise = o => typeof o.then === 'function';

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
    this._send(message);
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
          return this._send(serialize(packet));
        }
        return this._send(serialize({c: 0, i: callbackId, p: data}));
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

  _send(data) {
    for (const conn of _connections) {
      if (conn.readyState !== 1) {
        //console.log('Connection not in readyState readyState=', conn.readyState, 'data=', data);
        continue;
      }
      conn.send(data);
    }
  }
}

//util.inherits(Server, events.EventEmitter);
Server.prototype.$emitLocal = EventEmitter.prototype.emit;

function noop() {}

const initMessaging = (wss, hook) => {
  function heartbeat() {
    this.isAlive = true;
  }

  wss.on('connection', function connection(ws) {
    console.log('adding connection');
    _connections.add(ws);
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.on('close', function connection(ws) {
      console.log('deleting connection');
      _connections.delete(ws);
    });

    hook(new Server(ws));
  });

  const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        console.log('terminating connection');
        _connections.delete(ws);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping(noop);
    });
  }, 30000);
};

module.exports = {Server, initMessaging};
