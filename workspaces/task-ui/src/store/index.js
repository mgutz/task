import _ from 'lodash'
import {init} from '@rematch/core'
import selectorsPlugin from '@rematch/select'
import {activeHistories} from './activeHistories'
import {taskfiles} from './taskfiles'
import {logs} from './logs'
import {histories} from './histories'
import {init as initWebSocketClient} from '#/services/websocket'
import {router as router5} from '#/services/router'
import {project} from './project'
import {initRouter5} from './router'
import {api} from './api'
import routes from '#/routes'
//import {trace} from './middleware/trace'
import recordPlugin from './plugins/recordPlugin'

const recordable = ['taskfiles/run']

export const createStore = async () => {
  const router = await initRouter5(routes, {defaultRoute: 'tasks'})
  const models = {
    activeHistories,
    api,
    histories,
    logs,
    project,
    router,
    taskfiles,
  }

  const store = init({
    models,
    plugins: [selectorsPlugin(), recordPlugin(recordable)],
    redux: {
      middlewares: [],
      rootReducers: {
        RESET: () => undefined,
      },
    },
  })

  const wsClient = await initWebSocketClient()

  hookWebSocket(store.dispatch, wsClient)
  hookRouter(store.dispatch)
  _.set(window, 'DBG.store', store)
  return store
}

/**
 * Handle process events from server.
 */
const hookWebSocket = (dispatch, client) => {
  // process.stdout event
  client.on('pout', dispatch.taskfiles.pout)

  // process.stderr event
  client.on('perr', dispatch.taskfiles.perr)

  // process error event
  client.on('perror', dispatch.taskfiles.perror)

  // process close event
  client.on('pclose', dispatch.taskfiles.pclose)
}

const hookRouter = (dispatch) => {
  router5.addListener((toState, fromState) => {
    if (router5.areStatesEqual(toState, fromState)) return
    dispatch.router.setRoute(toState)
  })
}
