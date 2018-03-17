import {konsole} from '#/util'
import {default as createRouter5} from 'router5'
import loggerPlugin from 'router5/plugins/logger'
import listenersPlugin from 'router5/plugins/listeners'
import browserPlugin from 'router5/plugins/browser'
import {routes} from '#/routes'

let _router

// returns state
export const initRouter5 = async () => {
  _router = createRouter5(routes, {
    defaultRoute: '/',
  })
    // Plugins
    .usePlugin(loggerPlugin)
    .usePlugin(
      browserPlugin({
        useHash: true,
      })
    )

  _router.usePlugin(listenersPlugin())

  return new Promise((resolve, reject) => {
    _router.start((err, state) => {
      if (err) return reject(err)
      konsole.log('router5 initial state', state)
      return resolve(state)
    })
  })
}

export const router = {
  state: {},

  reducers: {
    setRoute: (state, payload) => {
      return {...state, previousRoute: state.route, route: payload}
    },
  },

  effects: {
    navigate(args) {
      const {name, params} = args
      _router.navigate(name, params, (err, state) => {
        if (err) {
          if (err.code !== 'SAME_STATES') {
            konsole.error('Navigation Error', err)
          }
          return
        }
        this.setRoute(state)
      })
    },
  },
}
