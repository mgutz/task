import {konsole} from '#/util'
export const trace = () => (next) => (action) => {
  konsole.log('Middleware triggered:', action)
  next(action)
}
