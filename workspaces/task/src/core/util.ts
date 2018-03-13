import * as _ from 'lodash'
import * as fp from 'path'
import {inspect, promisify} from 'util'
import * as fs from 'fs'
const readFileAsync = promisify(fs.readFile)

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

export const readJSONFile = async (filename: string): Promise<any> => {
  const content = await readFileAsync(filename, 'utf8')
  const [json, err] = safeParseJSON(content)
  if (err) throw err
  return json
}
