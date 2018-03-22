import {konsole} from '#/util'
import {createRouter} from '../services/router'

// Initializes router and returns a model.
export const initRouter5 = async (routes, opts = {}) => {
  const router5 = createRouter(routes, opts)

  const model = {
    name: 'router',

    state: {
      router: router5,
    },

    reducers: {
      setRoute: (state, payload) => {
        return {...state, previousRoute: state.route, route: payload}
      },
    },

    effects: {
      navigate(args) {
        const {name, params} = args
        router5.navigate(name, params, (err, state) => {
          console.log('store NAVIGATE', {err, state})
          if (err) {
            if (err.code !== 'SAME_STATES') {
              konsole.error('Navigation Error', err)
            }
            return
          }
          this.setRoute(state)
        })
      },

      navigateToDefault() {
        router5.navigateToDefault((err, state) => {
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
      model.state.route = state
      return resolve(model)
    })
  })
}
