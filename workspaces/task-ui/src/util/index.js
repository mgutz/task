import * as _ from 'lodash'
import * as shortid from 'shortid'

/**
 * uid is short for unique id
 */
export const uid = () => {
  return shortid.generate()
}

export const konsole = console

export const titleize = (s) => {
  return _.upperFirst(_.camelCase(s))
}
export const taskTitle = (task) => {
  return task.taskfileId.toLowerCase() + '.' + _.camelCase(task.name)
}
