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

export const taskSlug = (task) => {
  return _.camelCase(task.taskfileId) + '.' + _.camelCase(task.name)
}

export const bookmarkSlug = (bookmark) => {
  return _.camelCase(bookmark.title)
}

export const stopPropagation = (e) => {
  e.stopPropagation()
  e.nativeEvent.stopImmediatePropagation()
}
