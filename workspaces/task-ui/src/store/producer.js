import produce from 'immer'

/**
 * Reduces the boilerplate for using immer. Reducers can now be defined as
 *
 * reducer: producer((draft, payload) => {
 *   // mutate draft and immer will calc the new state, do not need to RETURN
 *   // anything
 * })
 */
const producer = (fn) => (state, payload) => {
  return produce(state, (draft) => {
    fn(draft, payload)
  })
}

export default producer
