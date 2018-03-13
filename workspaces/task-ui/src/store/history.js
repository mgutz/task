import * as _ from 'lodash'
import producer from './producer'

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
    'taskfiles/addHistory': producer((draft, payload) => {
      const {pid, taskName} = payload
      const item = draft[taskName]
      if (!item) {
        draft[taskName] = [payload]
        return
      }

      // never modify, only add
      const found = _.find(item, {pid})
      if (!found) {
        draft[taskName].push(payload)
      }
    }),

    'taskfiles/updateHistory': producer((draft, payload) => {
      const {pid, taskName} = payload
      if (!pid || !taskName) return

      const items = draft[taskName]
      const idx = _.findIndex(items, {pid})
      if (idx > -1) {
        const item = items[idx]
        items[idx] = {...item, ...payload}
      }
    }),
  },

  // async action creators
  effects: {},
}
