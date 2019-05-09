import * as _ from 'lodash'
import * as contrib from '../contrib'
import * as fp from 'path'
import * as fs from 'fs'
import * as execa from 'execa'

import {inspect, promisify} from 'util'

import {newTerminalLogger} from './log'

const readFileAsync = promisify(fs.readFile)

export const appWorkDirectory: string = fp.resolve(__dirname, '..', '..')

export const prettify = (o: any) => inspect(o)

/**
 * Safely parses string `s` return [obj, err]
 *
 * @param s The string to be parsed.
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

/**
 * Reads JSON file, returning an object.
 *
 * @param filename The JSON file to open.
 */
export const readJSONFile = async (filename: string): Promise<any> => {
  const content = await readFileAsync(filename, 'utf8')
  const [json, err] = safeParseJSON(content)
  if (err) throw err
  return json
}

export const taskParam = (
  argv: Options,
  additionalProps: any = {}
): TaskParam => {
  const sh = require('shelljs')
  const globby = require('globby')
  const prompt = require('inquirer').createPromptModule()

  const konsole = newTerminalLogger()

  const execAsync = (...args: any[]) => {
    return new Promise((resolve, reject) => {
      sh.exec(...args, (code: number, stdout: string, stderr: string) => {
        if (code !== 0) {
          return reject({code, stdout, stderr})
        }
        return resolve({code, stdout, stderr})
      })
    })
  }

  return {
    _,
    argv: {...argv, _: argv._.slice(1), ...additionalProps}, // drop the command
    contrib,
    exec: execAsync,
    execa,
    globby,
    konsole,
    prompt,
    sh,
    shawn: contrib.shawn,
  }
}

/**
 * Returns the full path without dot extension.
 */
export const trimExtname = (path: string): string => {
  if (!path) return ''
  return fp.join(fp.dirname(path), fp.basename(path, fp.extname(path)))
}
