import * as _ from 'lodash'
import producer from './producer'

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
      if (!id) throw new Error('History id is required', payload)

      const item = draft[id]
      if (!item) throw new Error(`History not found for id: ${id}`)
      draft[id] = {...draft[id], ...payload}
    }),
  },

  // async action creators
  effects: {},

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
  },
}
