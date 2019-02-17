import * as _ from 'lodash'
import * as shortid from 'shortid'

/**
 * uid is short for unique id
 */
export const uid = () => {
  return shortid.generate()
}

export const konsole = console

export const pascalCase = (s) => {
  return _.upperFirst(camelCase(s))
}

export const camelCase = _.camelCase

export const taskSlug = (task) => {
  return pascalCase(task.taskfileId) + '.' + camelCase(task.name)
}

export const bookmarkSlug = (bookmark) => {
  return camelCase(bookmark.title)
}

export const stopPropagation = (e) => {
  e.stopPropagation()
  e.nativeEvent.stopImmediatePropagation()
}
