import * as fs from 'fs'
import * as fp from 'path'
import {konsole} from '../core/log'
import {readJSONFile} from '../core/util'

export const importPackageTasks = async (
  dir: string,
  prefix = 'npm '
): Promise<RawTask[] | undefined> => {
  const path = fp.join(dir, 'package.json')
  if (!fs.existsSync(path)) {
    konsole.error('package.json not found')
    return
  }

  const o = await readJSONFile(path)
  if (o.scripts) {
    const tasks: RawTask[] = []
    for (const k in o.scripts) {
      const script = o.scripts[k]

      tasks.push({
        name: prefix + k,
        run: ({sh}) => {
          return sh.exec(script)
        },
      })
    }

    return tasks
  }
}
