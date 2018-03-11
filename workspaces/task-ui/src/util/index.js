let _id = 0

/**
 * uid is short for unique id
 */
export const uid = () => {
  return `u${_id++}`
}

export const konsole = console
