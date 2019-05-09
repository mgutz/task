import * as exits from '../core/exits'

import {run as runRef, runThenWatch} from '../core/runner'

import {AppContext} from '../core/AppContext'
import {runnableRef} from '../core/tasks'
import {usage} from './options'

export const run = async (ctx: AppContext) => {
  const {options, tasks} = ctx

  const taskName = taskToRun(options)
  if (!taskName && !runnableRef(tasks, 'default')) {
    exits.message(usage(tasks))
  }

  const name = runnableRef(tasks, taskName || 'default')
  if (!name) {
    exits.error(`Task not found: ${options._[0]}`)
  }

  if (options.watch) {
    return runThenWatch(ctx, name).then(exits.okFn(), exits.errorFn())
  }

  return runRef(ctx, name).then(exits.okFn(), exits.errorFn())
}

const taskToRun = (argv: any): string => {
  return argv._[0]
}
