import {invoke} from '../services/websocket'

export const project = {
  state: {},

  reducers: {
    setProject: (state, payload) => {
      return payload
    },
  },

  effects: {
    load() {
      invoke('loadProject').then(this.setProject)
    },
  },
}
