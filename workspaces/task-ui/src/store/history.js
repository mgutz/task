import * as _ from 'lodash'
import * as imm from 'dot-prop-immutable'

export const history = {
  state: {},

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
    'tasks/addHistory': (state, payload) => {
      const {pid} = payload

      const item = state[payload.taskName]
      if (!item) {
        return imm.merge(state, payload.taskName, [payload])
      }

      const idx = _.findIndex(item, {pid})
      // never modify, only add
      if (idx < 0) {
        return imm.merge(state, payload.taskName, [payload])
      }

      return state
    },

    'tasks/updateHistory': (state, payload) => {
      const {pid, taskName} = payload
      if (!pid || !taskName) return state

      const item = state[payload.taskName]
      const idx = _.findIndex(item, {pid: payload.pid})
      if (idx > -1) {
        return imm.merge(state, `${taskName}.${idx}`, payload)
      }
      return state
    },
  },

  // async action creators
  effects: {},
}
