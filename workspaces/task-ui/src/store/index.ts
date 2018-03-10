import {init} from '@rematch/core'
import * as models from './models'

export const createStore = () => {
  return init({
    models,
  })
}
