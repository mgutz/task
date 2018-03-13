import producer from './producer'

export const logs = {
  // {[pid]: [[kind, lines] ...]}
  state: {},

  reducers: {
    'taskfiles/appendLog': producer((draft, payload) => {
      const {pid, lines, kind} = payload
      const spid = String(pid)
      const chunks = draft[spid]
      const chunk = [kind, lines]

      if (chunks) {
        chunks.push(chunk)
        return
      }
      draft[spid] = [chunk]
    }),
  },

  // async action creators
  effects: {},
}
