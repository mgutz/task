import * as _ from 'lodash'
import * as cp from 'child_process'
import * as fp from 'path'
import * as fs from 'fs'
import * as os from 'os'
import {createPromptModule} from 'inquirer'
import {konsole} from '../core/log'
import {readJSONFile} from '../core/util'
import {Project} from './types'

const prompt = createPromptModule()

const exampleTaskproject = `{
  "server": {
	  "storePath": ".tasklogs/{{taskfileId}}/{{taskName}}/{{timestamp}}-{{pid}}"
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
