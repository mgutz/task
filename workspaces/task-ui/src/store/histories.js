import * as _ from 'lodash'
import producer from './producer'
import {invoke} from '#/services/websocket'
import {konsole} from '#/util'
import {dispatch} from '@rematch/core'

export const histories = {
  state: {}, // {[key: string]: History}

  reducers: {
    'taskfiles/record': producer((draft, payload) => {
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
          `A process may be alive that is emitting events to an undefined history after a pagre refresh` // eslint-disable-line
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

    // Replay a history record with the option to override the reference
    // object. If ref is not provided then use the ref from record. A replay
    // of a task will aways reference the task itself. A bookmark replay overrides
    // the reference to the bookmark and the args executed are of the original
    // task.
    replay({ref, record}) {
      console.log('REPLAYING', record)
      dispatch.taskfiles.run({ref: ref || record.ref, ...record.args})
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
