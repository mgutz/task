import {invoke} from '../services/ws'

export const tasks = {
  state: [],

  reducers: {},

  effects: {
    all() {
      invoke('tasks').then((res: any) => {
        console.log('res', res)
        // update state
      })
    },
  },
}
