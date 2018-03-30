import _ from 'lodash'
import {invoke} from '#/services/websocket'
import * as t from 'tcomb'
import {select} from '@rematch/select'

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
        task.taskfileId = taskfileId
        if (task.ui && task.ui.formatLog) {
          task.formatLog = _.template(task.ui.formatLog)
        }

        // rehydrate history and processes
        const {execHistory} = task
        if (execHistory) {
          for (const eh of execHistory) {
            const record = eh.tag
            // whether we are attached to the process logs
            record.attached = false
            record.status = 'closed'
            record.logFile = eh.logFile

            if (!record) continue

            this.record(record)

            const pid = eh.pid
            if (pid) {
              this.updateHistory({
                id: record.id,
                status: 'running',
                pid,
              })
            }
          }
        }
      }
      this.mergeTasks({taskfileId, tasks})
    })
  },

  //// websocket dispatch these p* events in ./index.js

  // remote proc close event
  pclose(payload) {
    const [tag, code] = payload
    this.updateHistory({
      id: tag,
      status: 'closed',
      statusedAt: Date.now(),
      code,
    })
  },

  // remote proc stderr data
  perr(payload) {
    const [tag, lines] = payload // eslint-disable-line
    this.appendLog({id: tag, lines, kind: logKind.stderr})
  },

  // remote proc error event
  perror(payload) {
    const [tag, error] = payload
    this.updateHistory({
      id: tag,
      status: 'errored',
      statusedAt: Date.now(),
      error,
    })
  },

  // remote proc stdout data
  pout(payload) {
    const [tag, lines] = payload // eslint-disable-line
    this.appendLog({id: tag, lines, kind: logKind.stdout})
    //setTimeout(() => this.appendLog({id: tag, lines, kind: logKind.stdout}), 1)
  },

  /**
   * Runs a task
   *
   */
  run(payload, rootState) {
    const validate = t.struct({
      args: t.Array,
      historyId: t.String,
    })
    const {args, historyId} = validate(payload)
    const [taskfileId, taskName, ...rest] = args
    const history = select.histories.oneById(rootState, {id: historyId})

    // need other state

    // historyId is passed as tag
    return invoke('task.run', history, taskfileId, taskName, ...rest).then(
      (payload) => {
        const {pid, logFile} = payload
        this.updateHistory({
          id: historyId,
          logFile,
          pid,
          attached: false,
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
