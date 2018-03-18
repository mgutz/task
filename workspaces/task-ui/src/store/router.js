import {konsole} from '#/util'
import loggerPlugin from 'router5/plugins/logger'
import listenersPlugin from 'router5/plugins/listeners'
import browserPlugin from 'router5/plugins/browser'
import {default as createRouter5} from 'router5'

// returns state
export const initRouter5 = async (routes, opts = {defaultRoute: 'tasks'}) => {
  const router5 = createRouter5(routes, opts)
    // Plugins
    .usePlugin(loggerPlugin)
    .usePlugin(browserPlugin())
    .usePlugin(listenersPlugin())

  const model = {
    name: 'router',

    state: {},

    reducers: {
      setRoute: (state, payload) => {
        return {...state, previousRoute: state.route, route: payload}
      },
    },

    effects: {
      navigate(args) {
        const {name, params} = args
        router5.navigate(name, params, (err, state) => {
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

  return new Promise((resolve, reject) => {
    router5.start((err, state) => {
      if (err) return reject(err)
      konsole.log('router5 initial state', state)
      model.state.route = state
      return resolve(model)
    })
  })
}
