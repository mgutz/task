import _ from 'lodash'
import {invoke} from '#/services/websocket'

export const api = {
  state: {
    findProcessResult: [],
  },

  reducers: {
    setKV: (state, {key, value}) => {
      return {...state, [key]: value}
    },
  },

  effects: {
    findProcess({keyword}) {
      let kind
      if (keyword.startsWith(':')) {
        kind = 'port'
        keyword = keyword.slice(1)
      } else if (keyword.match(/^\d+$/)) {
        kind = 'pid'
      } else {
        kind = 'name'
      }

      invoke('filterProcesses', kind, keyword)
        .then((value) => {
          this.setKV({key: 'findProcessResult', value})
        })
        .catch(() => {
          this.setKV({key: 'findProcessResult', value: []})
        })
    },
  },
}
