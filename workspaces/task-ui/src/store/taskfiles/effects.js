import {invoke} from '#/services/websocket'
import * as t from 'tcomb'
import {konsole, uid} from '#/util'

// Some reducers are listened for in other models but (for now) they still need
// to be defined. This is an identity function.

const logKind = {
  stdout: 0,
  stderr: 1,
}

export const effects = {
  // async action creators
  fetchTasks({taskfileId}) {
    invoke('tasks', taskfileId).then((tasks) => {
      if (!Array.isArray(tasks) || tasks.length < 1) return
      // makes code a lot easier if there is unique id
      for (const task of tasks) {
        task.id = uid()
        task.taskfileId = taskfileId
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
      error,
    })
  },

  // remote proc stdout data
  pout(payload) {
    const [tag, _pid, lines] = payload // eslint-disable-line
    this.appendLog({id: tag, lines, kind: logKind.stdout})
  },

  /**
   * Runs a task
   *
   */
  run(payload) {
    const validate = t.struct({
      args: t.Array,
      newHistoryId: t.String,
      refId: t.String,
      refKind: t.String,
    })
    const {args, newHistoryId, refId, refKind} = validate(payload)
    const [taskfileId, taskName, ...rest] = args
    //const newId = uid() // TODO this needs to be next callback id
    this.addHistory({
      id: newHistoryId,
      args,
      createdAt: Date.now(),
      refKind,
      refId,
      status: 'running',
    })

    // historyId is passed as tag
    return invoke('run', newHistoryId, taskfileId, taskName, ...rest).then(
      (payload) => {
        const {pid} = payload
        this.updateHistory({
          id: newHistoryId,
          pid,
          taskfileId,
          taskName,
        })
      }
    )
  },

  setActiveHistory(payload) {
    const validate = t.struct({
      id: t.String,
      historyId: t.String,
    })
    const {id, historyId} = validate(payload)

    // example payload = {taskName, activeRunId}
    this.updateTask({id, activeHistoryId: historyId})
  },

  /**
   * Stops a task.
   *
   * @param args any[]
   */
  stop(args) {
    invoke('stop', ...args).then((res) => {
      konsole.log('stop result', res)
      // update state
    })
  },

  update(payload) {
    if (!payload.id) throw new Error('taskName is required')
    // example payload = {taskName, activeRunId}
    this.updateTask(payload)
  },
}
