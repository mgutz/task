import * as t from 'tcomb'

export const activeHistories = {
  state: {},

  reducers: {
    setActive(state, payload) {
      const validate = t.struct({
        oid: t.String,
        historyId: t.String,
      })
      const {oid, historyId} = validate(payload)
      return {...state, [oid]: historyId}
    },
  },

  effects: {
    setActiveHistory(payload) {
      this.setActive(payload)
    },
  },
}
