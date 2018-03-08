const cp = require('child_process')

// '-c' tells bash and sh to run a command string
const shellArgs = ['-c']

// shawn returns a spawned shell (defaults to bash) which must be executed
function shawn(script, options = {}) {
  const shell = options.shell || '/bin/bash'

  // regarding detached, see https://stackoverflow.com/a/33367711
  const opts = {stdio: 'inherit', detached: true, shellArgs, ...options}

  // execute the script
  const params = [].concat(opts.shellArgs, script)
  const proc = cp.spawn(shell, params, opts)
  return proc
}

module.exports = {shawn}
