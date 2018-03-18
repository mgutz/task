import * as _ from 'lodash'
import {invoke} from '../services/websocket'
import * as t from 'tcomb'
import producer from './producer'
import {uid} from '#/util'

export const project = {
  state: {},

  reducers: {
    addHistory: producer((draft, payload) => {
      if (!draft.histories) {
        draft.histories = [payload]
        return
      }
      draft.histories.push(payload)
    }),

    setProject: producer((draft, payload) => {
      return payload
    }),
  },

  effects: {
    load() {
      invoke('loadProject').then(this.setProject)
    },

    saveHistory(payload) {
      const validate = t.struct({
        title: t.String,
        history: t.Object,
      })
      validate(payload)

      const {history, title} = payload
      const id = uid()
      this.addHistory({
        id,
        title,
        kind: history.kind,
        params: {
          taskfileId: history.taskfileId,
          taskName: history.taskName,
          args: history.args,
        },
      })

      invoke('addHistory', {...history, id, title, scope: 'project'})
    },
  },

  selectors: {
    savedById(state, id) {
      return _.find(state.histories, {id})
    },
  },
}
