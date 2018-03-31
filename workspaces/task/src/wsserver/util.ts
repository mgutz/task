import * as _ from 'lodash'
import * as cp from 'child_process'
import * as fp from 'path'
import * as fs from 'fs'
import * as os from 'os'
import {createPromptModule} from 'inquirer'
import {konsole} from '../core/log'
import {readJSONFile, safeParseJSON} from '../core/util'
import {Project} from './types'
import * as globby from 'globby'
import {promisify} from 'util'

const readFile = promisify(fs.readFile)
const existsAsync = promisify(fs.exists)

const prompt = createPromptModule()

const exampleTaskproject = `{
  "server": {
  },
  "taskfiles": [
    {"id": "Main", "desc":"Main",  "path": "./Taskfile.js", "argv": []}
  ]
}`

export const loadProjectFile = async (
  argv: Options,
  isRunning = false
): Promise<Project> => {
  let projectFile = argv.projectFile
  if (projectFile) {
    if (!fs.existsSync(projectFile)) {
      konsole.error('Project file not found:', projectFile)
      process.exit(1)
    }
  } else {
    projectFile = 'Taskproject.json'
    const exists = fs.existsSync(projectFile)
    if (!exists) {
      if (isRunning) {
        throw new Error(`Project file not found. ${projectFile}`)
      } else {
        await prompt([
          {
            default: false,
            message: `A project file was not found. Create ${projectFile}`, // tslint:disable-line
            name: 'create',
            type: 'confirm',
          },
        ]).then((answers: any) => {
          if (!answers.create) {
            process.exit(0)
          }
          fs.writeFileSync(projectFile, exampleTaskproject, 'utf-8')
        })
      }
    }
  }

  const proj = (await readJSONFile(projectFile)) as Project
  proj.path = projectFile
  return proj
}

export const relativeToHomeDir = (path: string): string =>
  fp.join('~', fp.relative(os.homedir(), fp.resolve(path)))

/**
 * The client MUST NOT be allowed to override taskfile and projectfile.
 * @param argv Users
 */
export const sanitizeInboundArgv = (argv: Options): Options => {
  if (_.isEmpty(argv)) return {} as Options

  // TODO task options need to be separate from CLI options
  //
  // In this example: task foo --help -- --help
  //   foo is the task to run
  //   --help is argument to CLI
  //   -- help is argument to the task to run
  return _.omit(argv, [
    '_',
    'file',
    'help',
    'server',
    'init',
    'initExample',
    'list',
    'projectFile',
  ]) as Options
}

const pidDir = '.pids'

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g
// tslint:disable-next-line
const pathPattern = `${pidDir}/{{taskfileId}}/{{taskName}}-{{timestamp}}`
const logBaseTemplate = _.template(pathPattern)
export interface LogBaseParam {
  extName?: string
  pid?: string
  taskfileId: string
  taskName: string
  timestamp: string
}

export const logBase = (arg: LogBaseParam) => {
  return logBaseTemplate(arg)
}

const reLogBase = /\/([^\/]+)\/([^\-]+)-([^.]+)(\..+)$/

const parseLogPath = async (path: string): Promise<ExecInfo | undefined> => {
  const matches = path.match(reLogBase)
  if (!matches) return

  // export interface ExecInfo {
  //   logFile: string
  //   pid: string
  //   tag: string // history id
  //   taskfileId: string
  //   taskName: string
  //   timestamp: string
  // }

  const info: ExecInfo = {
    logFile: path,
    tag: '',
    taskName: matches[2],
    taskfileId: matches[1],
    timestamp: matches[3],
  }

  const pidFile = path.replace(/\.log/, '.pid')
  if (await existsAsync(pidFile)) {
    info.pid = await readFile(pidFile, 'utf-8')
  }

  const tagFile = path.replace(/\.log/, '.tag')
  if (await existsAsync(tagFile)) {
    const [obj, err] = safeParseJSON(await readFile(tagFile, 'utf-8'))
    if (err) throw err
    info.tag = obj
  }

  return info
}

export const getExecHistory = async (
  taskfileId: string,
  taskName: string
): Promise<ExecInfo[]> => {
  const files = await globby([`${pidDir}/${taskfileId}/${taskName}-*.log`])
  if (!files.length) return []

  const result = []
  for (const file of files) {
    result.push(await parseLogPath(file))
  }

  return _.compact(result)
}

export const formatDate = (d = new Date()) => {
  return (
    d.getFullYear() +
    '' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '' +
    ('0' + d.getDate()).slice(-2) +
    'T' +
    +('0' + d.getHours()).slice(-2) +
    ('0' + d.getMinutes()).slice(-2) +
    ',' +
    ('00' + d.getMilliseconds()).slice(-3)
  )
}
