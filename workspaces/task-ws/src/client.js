/**
 * License: MIT
 * @see https://github.com/epixa/chuckt/blob/master/LICENSE.md
 * @version 0.2.0
 */

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

  async invoke(event, ...args) {
    return new Promise((resolve, reject) => {
      this.emit(event, args, obj => {
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

/**
 * Callback collection
 *
 * Since callbacks are inherently volatile (once a registered callback is
 * fired, it is permanently deleted), some minor callback management is
 * necessary to minimize CPU and memory impact.
 *
 * @constructor
 */
var Callbacks = function() {
  this.callbacks = [];
  this.max = 1;
};

/**
 * Registers the given callback and returns the callback's id
 *
 * @param callback
 * @return {*}
 */
Callbacks.prototype.register = function(callback) {
  this.callbacks[++this.max] = callback;
  return this.max;
};

/**
 * Invokes the callback identified by the callbackid with any arguments
 *
 * @param callbackid
 * @param args
 */
Callbacks.prototype.use = function(callbackid, args) {
  this.callbacks[callbackid](args || {});
  delete this.callbacks[callbackid];
};
