import {invoke} from '#/services/websocket'
import * as t from 'tcomb'
import {konsole, uid} from '#/util'
import {select} from '@rematch/select'
import {dispatch} from '@rematch/core'

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
    const [tag, _pid, lines] = payload
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
    const [tag, _pid, lines] = payload
    this.appendLog({id: tag, lines, kind: logKind.stdout})
  },

  /**
   * Runs a task
   *
   * @param {any[]} args args[0] should be name of method to invoke.
   */
  run(args, rootState) {
    const [taskfileId, taskName, ...rest] = args
    const historyId = uid() // TODO this needs to be next callback id
    this.addHistory({
      id: historyId,
      args,
      createdAt: Date.now(),
      kind: 'run',
      method: 'run',
      status: 'running',
      taskfileId,
      taskName,
    })

    // TODO this doesn't feel right to put this here
    if (rootState.router.route.name.startsWith('tasks')) {
      const params = {
        taskfileId,
        taskName,
        historyId,
      }
      console.log('asdf', params)
      dispatch.router.navigate({name: 'tasks.name.history', params})
    }
    this.updateTask({taskfileId, activeHistoryId: historyId, taskName})

    // historyId is passed as tag
    return invoke('run', historyId, taskfileId, taskName, ...rest).then(
      (payload) => {
        const {pid} = payload
        this.updateHistory({
          id: historyId,
          pid,
          taskfileId,
          taskName,
        })
      }
    )
  },

  // replays a run-time history entry
  replay(args, rootState) {
    const validate = t.struct({
      id: t.String,
    })
    validate(args)

    const history = select.histories.oneById(rootState, args)
    if (!history) {
      konsole.error('History not found with args', args)
    }

    this.run(history.args)
  },

  // reruns a saved task
  rerun(args) {
    const validate = t.struct({
      kind: t.String,
      args: t.Array,
    })
    validate(args)
    this.run(args.args)
  },

  setActiveHistoryId(payload) {
    const validate = t.struct({
      taskfileId: t.String,
      taskName: t.String,
      historyId: t.string,
    })
    validate(payload)

    const {taskfileId, taskName, historyId} = payload

    // example payload = {taskName, activeRunId}
    this.updateTask({taskfileId, taskName, activeHistoryId: historyId})
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
    if (!payload.taskName) throw new Error('taskName is required')
    // example payload = {taskName, activeRunId}
    this.updateTask(payload)
  },
}
