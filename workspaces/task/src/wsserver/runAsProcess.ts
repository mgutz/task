import * as _ from 'lodash'
import * as cp from 'child_process'
import * as fp from 'path'
import * as fs from 'fs'
import * as stream from 'stream'
import * as mkdirP from 'mkdirp'
import {promisify} from 'util'
import {ResolverContext} from './types'
import * as websocketStream from 'websocket-stream'
import {Tail} from 'tail'
import {konsole} from '../core/log'

const mkdirp = promisify(mkdirP)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

const taskScript = fp.resolve(__dirname, '..', '..', 'index.js')

export interface RunAsProcessParam {
  context: ResolverContext
  tag: string
  taskfileId: string
  taskName: string
  argv: Options
  client: any
}

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g

const defaultLogPathPattern = '.pids/{{taskfileId}}/{{taskName}}-{{timestamp}}'

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
const runAsProcess = async ({
  context,
  tag,
  taskfileId,
  taskName,
  argv,
  client,
}: RunAsProcessParam): Promise<cp.ChildProcess> => {
  const {project} = context
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

  // When task is run as a server, it should be long-lived like tmux. Each
  // process pipesj stdout, stderr to file. When task restarts it will read
  // from these proc logs.

  const pid = process.pid // use parent's PID
  const pathPattern = project.server.logPathPattern || defaultLogPathPattern
  const template = _.template(pathPattern)
  const logBase = template({
    taskName,
    taskfileId,
    timestamp: new Date().toISOString(),
  })
  const logDir = fp.dirname(logBase)
  await mkdirp(logDir)

  const logFile = logBase + '.log'
  const pidFile = logBase + '.pid'

  const fd = fs.openSync(logFile, 'a')
  const fileStream = fs.createWriteStream('', {fd})
  const opts = {
    cwd: fp.dirname(argv.file),
    detached: true,
    env: {
      ...process.env,
      task_ipc_options: argvstr,
    },
    stdio: ['ignore', fd, fd],
  }

  // execute the script
  const params = [taskScript]
  const proc = cp.spawn('node', params, opts)

  proc.on('close', (code) => {
    fs.unlinkSync(pidFile)
    fs.closeSync(fd)
    client.emit('pclose', [tag, proc.pid, code])
  })

  proc.on('error', (err) => {
    fs.unlinkSync(pidFile)
    fs.closeSync(fd)
    client.emit('perror', [tag, proc.pid, err])
  })

  // create pid file
  await writeFile(pidFile, String(proc.pid))

  const tail = new Tail(logFile)
  tail.on('line', (line: string) => client.emit('pout', [tag, proc.pid, line]))
  tail.on('error', (err: Error) =>
    konsole.error(`Could not tail ${logFile}`, err)
  )

  return proc
}

export default runAsProcess
