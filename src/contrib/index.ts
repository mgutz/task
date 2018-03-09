import * as cp from 'child_process'

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

/**
 * sleep is use dto sleep for arbitrary milliseconds.
 */
export const sleep = async (millis: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, millis))
