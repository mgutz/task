'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
const cp = require('child_process')
const fp = require('path')
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
exports.runAsProcess = (taskName, argv, client) => {
  argv._[0] = taskName
  argv.server = false
  const opts = {
    detached: true,
    env: Object.assign({}, process.env, {
      task_ipc_options: JSON.stringify(argv),
    }),
  }
  // execute the script
  const params = [taskScript]
  const proc = cp.spawn('node', params, opts)
  proc.stdout.setEncoding('utf-8')
  proc.stdout.on('data', (data) => {
    client.send('pout', [taskName, proc.pid, data])
  })
  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', (data) => {
    client.send('perr', [taskName, proc.pid, data])
  })
  proc.on('close', (code) => {
    client.send('pclose', [taskName, proc.pid, code])
  })
  proc.on('error', (err) => {
    client.send('perror', [taskName, proc.pid, err])
  })
  return proc
}
//# sourceMappingURL=runAsProcess.js.map
