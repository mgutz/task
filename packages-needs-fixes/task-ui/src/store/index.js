import routes from '#/routes'
import {router as router5} from '#/services/router'
import {init as initWebSocketClient} from '#/services/websocket'
import _ from 'lodash'
import raf from 'raf'
import {batchedSubscribe} from 'redux-batched-subscribe'
import {init} from '@rematch/core'
import selectorsPlugin from '@rematch/select'
import {activeHistories} from './activeHistories'
import {api} from './api'
import {histories} from './histories'
import {logs} from './logs'
//import {trace} from './middleware/trace'
import recordPlugin from './plugins/recordPlugin'
import {project} from './project'
import {initRouter5} from './router'
import {taskfiles} from './taskfiles'

const recordable = ['taskfiles/run']

let rafId
const rafUpdateBatcher = _.debounce((notify /*, action, getState*/) => {
  if (rafId) return
  rafId = raf(() => {
    rafId = null
    notify()
  })
}, 16)

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
      // muy excellente! https://github.com/tappleby/redux-batched-subscribe/issues/11
      enhancers: [batchedSubscribe(rafUpdateBatcher)],
      middlewares: [],
      rootReducers: {
        RESET: () => undefined,
      },
    },
  })
  _.set(window, 'DBG.store', store)

  await hookWebSocket(store.dispatch)
  hookRouter(store.dispatch)
  return store
}

/**
 * Handle process events from server.
 */
const hookWebSocket = async (dispatch) => {
  const client = await initWebSocketClient()
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
