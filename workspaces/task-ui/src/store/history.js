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
      const {pid, taskfileId, taskName} = payload
      const id = calcId(taskfileId, taskName)
      const item = draft[id]
      if (!item) {
        draft[id] = [payload]
        return
      }

      // never modify, only add
      const found = _.find(item, {pid})
      if (!found) {
        draft[id].push(payload)
      }
    }),

    'taskfiles/updateHistory': producer((draft, payload) => {
      const {pid, taskName, taskfileId} = payload
      if (!pid || !taskName) return

      const id = calcId(taskfileId, taskName)

      const items = draft[id]
      const idx = _.findIndex(items, {pid})
      if (idx > -1) {
        const item = items[idx]
        items[idx] = {...item, ...payload}
      }
    }),
  },

  // async action creators
  effects: {},

  selectors: {
    byTaskfileIdAndTaskName(state, payload) {
      const {taskfileId, taskName} = payload
      const id = calcId(taskfileId, taskName)
      const histories = state[id]
      return histories
    },
  },
}

const calcId = (taskfileId, taskName) => {
  return `${taskfileId}-${taskName}`
}
