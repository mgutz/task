/* eslint-disable no-console */

const isPromise = (o) => o && typeof o.then === 'function'

const noCallbackMessage =
  'There is no callback and error occured while executing a registered method.'

/**
 * Registry for RPC Handlers
 */
class RPCRegistry {
  constructor() {
    this.handlers = {}
  }

  register(ns, handlersObject, query = (key) => key[0] !== '_') {
    const handlers = {}
    for (const k in handlersObject) {
      const handler = handlersObject[k]
      if (typeof handler === 'function' && query(k))
        handlers[k] = this.wrap(handler)
    }
    this.handlers = ns
      ? Object.assign({}, this.handlers, {[ns]: handlers})
      : Object.assign({}, this.handlers, handlers)
  }

  get(name) {
    let fn = this.handlers
    const parts = name.split('.')
    for (const name of parts) {
      fn = fn[name]
    }
    return fn
  }

  wrap(handler) {
    return (ctx, args, cb) => {
      try {
        const result =
          args && args.length ? handler(ctx, ...args) : handler(ctx)

        // ensure errors are logged, forwarded with or without callback
        if (isPromise(result)) {
          if (cb) {
            return result.then((res) => cb(null, res), cb)
          }
          return result.catch((err) => {
            console.error(noCallbackMessage, err)
          })
        } else {
          if (cb) cb(null, result)
        }
      } catch (err) {
        console.error('ERR', err)
        if (cb) return cb(err)
        console.error(noCallbackMessage, err)
      }
    }
  }
}

module.exports = {RPCRegistry}
