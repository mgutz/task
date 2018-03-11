import {default as createRouter5} from 'router5'
import loggerPlugin from 'router5/plugins/logger'
import listenersPlugin from 'router5/plugins/listeners'
import browserPlugin from 'router5/plugins/browser'
import {routes} from '#/routes'

export const createRouter = () => {
  const router = createRouter5(routes, {
    defaultRoute: '/',
  })
    // Plugins
    .usePlugin(loggerPlugin)
    .usePlugin(
      browserPlugin({
        useHash: true,
      })
    )

  router.usePlugin(listenersPlugin())
  return router
}