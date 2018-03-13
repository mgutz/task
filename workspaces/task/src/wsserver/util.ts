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
 * The argv must have`_.[0]` be the task name and `gui: false`.
 */
export const runAsProcess = (
  taskfileId: string,
  taskName: string,
  argv: Options,
  client: any
): cp.ChildProcess => {
  argv._[0] = taskName
  argv.gui = false

  const newArgv = _.pick(argv, [
    '_',
    'babel',
    'debug',
    'dotenv',
    'file',
    'dryRun',
    'silent',
    'trace',
    'typescript',
    'watch',
    'babelExtensions',
    'name',
  ])

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
  console.log('???????DBG:PARAMS', params)
  console.log('???????DBG:ARGV', argvstr)
  const proc = cp.spawn('node', params, opts)

  proc.stdout.setEncoding('utf-8')
  proc.stdout.on('data', (data) => {
    console.log('pout', data)
    client.send('pout', [taskfileId, taskName, proc.pid, data])
  })

  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', (data) => {
    console.log('perr', data)
    client.send('perr', [taskfileId, taskName, proc.pid, data])
  })

  proc.on('close', (code) => {
    console.log('pclose', code)
    client.send('pclose', [taskfileId, taskName, proc.pid, code])
  })

  proc.on('error', (err) => {
    console.log('pclose', err)
    client.send('perror', [taskfileId, taskName, proc.pid, err])
  })

  return proc
}

const exampleTaskproject = `
{
  "Taskfiles": []
}
`

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

  return readJSONFile(projectFile)
}
