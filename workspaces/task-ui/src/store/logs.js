import * as imm from 'dot-prop-immutable'

export const logs = {
  // {[pid]: [[kind, lines] ...]}
  state: {},

  reducers: {
    'tasks/appendLog': (state, payload) => {
      const {pid, lines, kind} = payload
      const spid = String(pid)

      const item = state[spid]
      if (!item) {
        return imm.set(state, spid, [[kind, lines]])
      }
      return imm.set(state, spid, [...item, [kind, lines]])
    },
  },

  // async action creators
  effects: {},
}
