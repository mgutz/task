import _ from 'lodash'
import {invoke} from '#/services/websocket'
import * as t from 'tcomb'
import {uid} from '#/util'

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g

// Some reducers are listened for in other models but (for now) they still need
// to be defined. This is an identity function.

const logKind = {
  stdout: 0,
  stderr: 1,
}

export const effects = {
  // async action creators
  fetchTasks({taskfileId}) {
    invoke('task.tasks', taskfileId).then((tasks) => {
      if (!Array.isArray(tasks) || tasks.length < 1) return
      // makes code a lot easier if there is unique id
      for (const task of tasks) {
        task.id = uid()
        task.taskfileId = taskfileId
        if (task.ui && task.ui.formatLog) {
          task.formatLog = _.template(task.ui.formatLog)
        }
      }
      this.mergeTasks({taskfileId, tasks})
    })
  },

  //// websocket dispatch these p* events in ./index.js

  // remote proc close event
  pclose(payload) {
    const [tag, pid, code] = payload
    this.updateHistory({
      id: tag,
      pid,
      status: 'closed',
      statusedAt: Date.now(),
      code,
    })
  },

  // remote proc stderr data
  perr(payload) {
    const [tag, _pid, lines] = payload // eslint-disable-line
    this.appendLog({id: tag, lines, kind: logKind.stderr})
  },

  // remote proc error event
  perror(payload) {
    const [tag, pid, error] = payload
    this.updateHistory({
      id: tag,
      pid,
      status: 'errored',
      statusedAt: Date.now(),
      error,
    })
  },

  // remote proc stdout data
  pout(payload) {
    const [tag, _pid, lines] = payload // eslint-disable-line
    this.appendLog({id: tag, lines, kind: logKind.stdout})
    //setTimeout(() => this.appendLog({id: tag, lines, kind: logKind.stdout}), 1)
  },

  /**
   * Runs a task
   *
   */
  run(payload) {
    const validate = t.struct({
      args: t.Array,
      historyId: t.String,
    })
    const {args, historyId} = validate(payload)
    const [taskfileId, taskName, ...rest] = args

    // historyId is passed as tag
    return invoke('task.run', historyId, taskfileId, taskName, ...rest).then(
      (payload) => {
        const {pid} = payload
        this.updateHistory({
          id: historyId,
          pid,
        })
      }
    )
  },

  update(payload) {
    if (!payload.id) throw new Error('taskName is required')
    // example payload = {taskName, activeRunId}
    this.updateTask(payload)
  },
}
