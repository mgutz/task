import * as _ from 'lodash'
import producer from './producer'
import {invoke} from '#/services/websocket'
import {konsole} from '#/util'

export const histories = {
  state: {}, // {[key: string]: History}

  reducers: {
    /**
     * Eash task has a history list where the last-in is newest.
     *
     * payload:
     *  pid - ID log
     *  taskName - the owner
     *  method - the remote method invoked
     *  args - the args for remote method
     */
    'taskfiles/addHistory': producer((draft, payload) => {
      const {id} = payload
      const item = draft[id]
      if (!item) {
        draft[id] = payload
        return
      }
    }),

    'taskfiles/updateHistory': producer((draft, payload) => {
      const {id} = payload
      if (!id) {
        konsole.error('History id is required', payload)
        return
      }

      const item = draft[id]
      if (!item) {
        konsole.error(`History not found for id: ${id}`)
        konsole.error(
          `A process may be alive that is emitting events to an undefined history after a pagre refresh`
        )
        return
      }
      draft[id] = {...draft[id], ...payload}
    }),
  },

  // async action creators
  effects: {
    stop({pid}) {
      invoke('stop', pid)
    },

    kill({argv}) {
      invoke('fkill', ...argv)
    },
  },

  selectors: {
    // example:
    // byQuery(state, {taskfileId, taskName})
    byQuery(state, payload) {
      return _.filter(state, payload)
    },

    // example:
    //  oneById(state, {id: 'someid'})
    oneById(state, payload) {
      const {id} = payload
      return state[id]
    },

    runningTasks(state) {
      return _.filter(state, {status: 'running'})
    },

    all(state) {
      return Object.values(state)
    },
  },
}
