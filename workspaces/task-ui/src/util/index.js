import * as shortid from 'shortid'

/**
 * uid is short for unique id
 */
export const uid = () => {
  return shortid.generate()
}

export const konsole = console
