import * as _ from 'lodash'
import * as cp from 'child_process'
import * as fp from 'path'
import * as fs from 'fs'
import {createPromptModule} from 'inquirer'
import {konsole} from '../core/log'
import {readJSONFile} from '../core/util'
import {Project} from './types'

const prompt = createPromptModule()
const taskScript = fp.resolve(__dirname, '..', '..', 'index.js')

/**
 * Since node doesn't have goroutines and libraries like webworker-thread and
 * tiny-worker do not work well with `require`, the best we can do
 * is spawn a task as a child process. In effect, task is calling itself
 * with pre-built argv passed through env variable name `task_ipc_options`
 *
 * Task checks if `task_ipc_options` is set before doing anything else.
 *
 * The argv must have`_.[0]` be the task name and `server: false`.
 */
export const runAsProcess = (
  tag: string,
  taskfileId: string,
  taskName: string,
  argv: Options,
  client: any
): cp.ChildProcess => {
  argv._[0] = taskName
  argv.server = false

  // const newArgv = _.pick(argv, [
  //   '_',
  //   'babel',
  //   'debug',
  //   'dotenv',
  //   'file',
  //   'dryRun',
  //   'silent',
  //   'trace',
  //   'typescript',
  //   'watch',
  //   'babelExtensions',
  //   'name',
  // ])

  const newArgv = argv

  const argvstr = JSON.stringify(newArgv)

  const opts = {
    cwd: fp.dirname(argv.file),
    detached: true,
    env: {
      ...process.env,
      task_ipc_options: argvstr,
    },
  }

  // execute the script
  const params = [taskScript]
  const proc = cp.spawn('node', params, opts)

  proc.stdout.setEncoding('utf-8')
  proc.stdout.on('data', (data) => {
    client.send('pout', [tag, proc.pid, data])
  })

  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', (data) => {
    client.send('perr', [tag, proc.pid, data])
  })

  proc.on('close', (code) => {
    client.send('pclose', [tag, proc.pid, code])
  })

  proc.on('error', (err) => {
    client.send('perror', [tag, proc.pid, err])
  })

  return proc
}

const exampleTaskproject = `{
  "server": {
	  "storePath": ".tasklogs/{{taskfileId}}/{{taskName}}/{{timestamp}}-{{pid}}"
  },
  "taskfiles": [
    {"id": "Main", "desc":"Main",  "path": "./Taskfile.js", "argv": []},
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
  console.log('DBG:0asdf', projectFile)
  proj.path = projectFile
  return proj
}
