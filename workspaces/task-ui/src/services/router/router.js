import {default as createRouter5} from 'router5'
//import loggerPlugin from 'router5/plugins/logger'
import listenersPlugin from 'router5/plugins/listeners'
import browserPlugin from 'router5/plugins/browser'

export let router

export const createRouter = (routes, opts = {defaultRoute: '/tasks'}) => {
  router = createRouter5(routes, opts)
    // Plugins
    //.usePlugin(loggerPlugin)
    .usePlugin(browserPlugin())
    .usePlugin(listenersPlugin())
  return router
}
