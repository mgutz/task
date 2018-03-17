const events = require('events');
const util = require('util');
const {serializeRaw} = require('./util');

/*
  {
    n: string     // event name
    p: any        // payload
    k: string     // stack
    c: number     // status code HTTPS statuses, 0 also means no error
    i: callbackid // callback id
    a: args       // arguments to method
*/

const Server = function(connection) {
  events.EventEmitter.call(this);
  this.conn = connection;

  var that = this;
  connection.on('message', function(data) {
    that.process.call(that, data);
  });
};

// inherit from EventEmitter; allow access to original emit()
util.inherits(Server, events.EventEmitter);
Server.prototype.$emitLocal = events.EventEmitter.prototype.emit;

/**
 * Emits an event that proxies through to the client connection
 *
 * Any additional arguments are passed as arguments for the event.
 *
 * Usage:
 *  Server.emit('my-custom-event', 'foo', 'bar');
 *  sends: {"n":"my-custom-event", "a":["foo","bar"]}}
 *
 * @param event
 * @return {*}
 */
Server.prototype.emit = function(event, payload) {
  // if (event === 'newListener') {
  //   return this.$emitLocal(event, ...args);
  // }
  const message = this.serialize({n: event, p: payload});
  return this.conn.send(message);
};

Server.prototype.emitRaw = function(event, payload) {
  // if (event === 'newListener') {
  //   return this.$emitLocal(event, ...args);
  // }

  return this.conn.send(serializeRaw(event, payload));
};

/**
 * Serializes the given data into json string with the Server prefix
 *
 * Usage:
 *  Server.serialize({event:'my-custom-event', args:['foo', 'bar']});
 *  returns: {"Server":{"event":"my-custom-event","args":["foo","bar"]}}
 *
 * @param data
 * @return {*}
 */
Server.prototype.serialize = function(data) {
  return JSON.stringify(data);
};

/**
 * Processes the given message string
 *
 * If the message string is a json encoded containing a property named
 * "Server", then the value of that property is processes as a Server event.
 *
 * @param message
 */
Server.prototype.process = function(message) {
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
};

const isPromise = o => typeof o.then === 'function';

Server.prototype.register = function(event, fn) {
  this.on(event, (args, cb = noop) => {
    try {
      const result = args && args.length ? fn(...args) : fn();
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
  });
};

function noop() {}

module.exports = Server;
