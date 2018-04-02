import * as cp from 'child_process'
import * as expandTilde from 'expand-tilde'
export * from './importPackageTasks'

const defaults = {
  shell: '/bin/bash',
  // '-c' tells bash and sh to run a command string
  shellArgs: ['-c'],
}

/**
 * shawn is short for shell spawns. It defaults to `bin/bash -c`. The options
 * are the same as node's ChildProcess. Additionally, `shell` and `shellArgs`
 * option props can be set to configure the the shell used.
 */
export const shawn = (script: string, options = {}) => {
  const {shell, shellArgs, ...otherOpts} = {...defaults, ...options}

  // regarding detached, see https://stackoverflow.com/a/33367711
  const opts = {
    cwd: undefined,
    detached: true,
    stdio: 'inherit',
    ...otherOpts,
  }

  if (opts.cwd) {
    opts.cwd = expandTilde(opts.cwd)
  }

  // execute the script
  const params = [...shellArgs, script]
  return cp.spawn(shell, params, opts)
}

/**
 * sleep is used to sleep for arbitrary milliseconds.
 */
export const sleep = async (millis: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, millis))
