const events = require('events');
const util = require('util');

/**
 * Applies Server event functionality to the given socket connection
 *
 * A listener is added to the connection's "data" event that passes the received
 * message to Server.process().
 *
 * @constructor
 */
const Server = function(connection) {
  events.EventEmitter.call(this);
  this.conn = connection;

  var that = this;
  this.conn.on('data', function(data) {
    that.process.call(that, data);
  });
};

// inherit from EventEmitter; allow access to original emit()
util.inherits(Server, events.EventEmitter);
Server.prototype.$emit = events.EventEmitter.prototype.emit;

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
Server.prototype.send = function(event, ...args) {
  if (event === 'newListener') {
    return this.$emit(event, ...args);
  }
  var message = this.serialize({e: event, a: args});
  return this.conn.write(message);
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

  const {n: name, a: args, callbackId: i} = o;

  var args = [name];

  if (Array.isArray(args)) {
    for (const arg in args) {
      args.push(arg);
    }
  }

  if (typeof callbackId !== 'undefined') {
    const conn = this.conn;
    const serialize = this.serialize;
    args.push(function(err, data) {
      if (err) {
        return conn.write(serialize({e: err, i: callbackId}))
      }
      return conn.write(seralize({i: callbackId, p: data}))
  }

  this.$emit(name, ...args)
};

const isPromise = o => typeof o.then === 'function';

const _registered = [];
Server.prototype.register = async function(event, fn) {
  if (registered.indexOf(event) > -1) throw new Error('Event has already been registered: ' + event);
  _registered.push(event);
  this.on(event, (event, args, cb = noop) => {
    const result = fn(event, ...args);
    if (isPromise(result)) {
      result.then(
        res => {
          cb(null, res);
        },
        err => cb(err)
      );
    } else {
      cb(null, result);
    }
  });
};

function noop() {}


module.exports = Server
