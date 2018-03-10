import * as _ from 'lodash'
import * as fp from 'path'
import {inspect} from 'util'

export const appWorkDirectory: string = fp.resolve(__dirname, '..', '..')

export const prettify = (o: any) => inspect(o)

/**
 * Safely parses string `s` return [obj, err]
 *
 * @param s JSON.stringified object.
 */
export const safeParseJSON = (s: string): any => {
  try {
    const obj = JSON.parse(s)
    if (_.isPlainObject(obj)) {
      return [obj, null]
    }
    return [null, 'Expected a JSON object']
  } catch (err) {
    return [null, err.message]
  }
}
