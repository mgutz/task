import * as _ from 'lodash'
import * as cp from 'child_process'
import * as fp from 'path'
import * as fs from 'fs'
import * as stream from 'stream'
import * as mkdirP from 'mkdirp'
import {promisify} from 'util'
import {ResolverContext} from './types'
import * as Tail from 'task-tail'
import {konsole} from '../core/log'
import {logBase, formatDate} from './util'

const mkdirp = promisify(mkdirP)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)

const taskScript = fp.resolve(__dirname, '..', '..', 'index.js')

export interface HistoryRecord {
  id: string
  [k: string]: any
}

export interface RunAsProcessParam {
  context: ResolverContext
  tag: HistoryRecord
  taskfileId: string
  taskName: string
  argv: Options
  client: any
}

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
  const historyId = tag.id

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

  const base = logBase({
    taskName,
    taskfileId,
    timestamp: formatDate(),
  })
  const logDir = fp.dirname(base)
  await mkdirp(logDir)

  const logFile = base + '.log'
  const pidFile = base + '.pid'
  const tagFile = base + '.tag'

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

  const tail = tailLog(client, logFile, historyId)

  // execute the script
  const params = [taskScript]
  const proc = cp.spawn('node', params, opts)

  proc.on('close', (code) => {
    fs.unlinkSync(pidFile)
    fs.closeSync(fd)
    // if (tail) tail.unwatch()
    client.emit('pclose', [historyId, code])
  })

  proc.on('error', (err) => {
    fs.unlinkSync(pidFile)
    fs.closeSync(fd)
    client.emit('perror', [historyId, err])
    // if (tail) tail.unwatch()
  })

  // create pid file which lets know if a process is running
  await writeFile(pidFile, String(proc.pid))
  // creat tag file which contains data echoed back to UI on refresh/restart
  await writeFile(tagFile, JSON.stringify(tag))

  // const tail = new Tail(logFile)
  // tail.on('line', (line: string) => client.emit('pout', [tag, line]))
  // tail.on('error', (err: Error) =>
  //   konsole.error(`Could not tail ${logFile}`, err)
  // )

  return proc
}

export const tailLog = (
  wsClient: any,
  logFile: string,
  historyId: string,
  batchLines = 5,
  intervalMs = 160
) => {
  let buf = ''

  const sendBuffer = () => {
    if (!buf) return
    const s = buf
    buf = ''
    wsClient.emit('pout', [historyId, s])
  }

  const intervalId = setInterval(sendBuffer, intervalMs)
  const tail = new Tail(logFile, '\n', {interval: 100})

  tail.on('line', (line: string) => {
    buf += line + '\n'
  })

  tail.on('error', (err: Error) => {
    clearInterval(intervalId)
    konsole.error(`Could not tail ${logFile}`, err)
  })

  return tail
}

export default runAsProcess
