import * as cp from 'child_process'

const defaults = {
  shell: '/bin/bash',
  // '-c' tells bash and sh to run a command string
  shellArgs: ['-c'],
}

// shawn returns a spawned shell (defaults to bash) which must be executed
export const shawn = (script: string, options = defaults) => {
  const {shell, shellArgs, ...otherOpts} = options

  // regarding detached, see https://stackoverflow.com/a/33367711
  const opts = {
    detached: true,
    stdio: 'inherit',
    ...otherOpts,
  }

  // execute the script
  const params = [...shellArgs, script]
  const proc = cp.spawn(shell, params, opts)
  return proc
}
