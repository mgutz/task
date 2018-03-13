import * as _ from 'lodash'
import * as t from 'tcomb'
import {invoke} from '#/services/websocket'
import {konsole} from '#/util'
import producer from '../producer'

const logKind = {
  stdout: 0,
  stderr: 1,
}

// Some reducers are listened for in other models but (for now) they still need
// to be defined. This is an identity function.
const handledElsewhere = (state) => state

const effects = {
  // async action creators
  fetchTasks({taskfileId}) {
    invoke('tasks', taskfileId).then((tasks) => {
      this.mergeTasks({taskfileId, tasks})
    })
  },

  //// websocket dispatch these p* events in ./index.js

  // remote proc close event
  pclose(payload) {
    const [taskfileId, taskName, pid, code] = payload
    this.updateHistory({
      taskfileId,
      taskName,
      pid,
      status: 'closed',
      statusedAt: Date.now(),
      code,
    })
  },

  // remote proc stderr data
  perr(payload) {
    const [taskfileId, taskName, pid, lines] = payload
    this.appendLog({taskfileId, taskName, pid, lines, kind: logKind.stderr})
  },

  // remote proc error event
  perror(payload) {
    const [taskfileId, taskName, pid, error] = payload
    this.updateHistory({taskfileId, taskName, pid, status: 'errored', error})
  },

  // remote proc stdout data
  pout(payload) {
    const [taskfileId, taskName, pid, lines] = payload
    this.appendLog({taskfileId, taskName, pid, lines, kind: logKind.stdout})
  },

  /**
   * Runs a task
   *
   * @param {any[]} args args[0] should be name of method to invoke.
   */
  run(args) {
    const [taskfileId, taskName] = args
    return invoke('run', ...args).then((payload) => {
      const {pid} = payload
      this.addHistory({
        args,
        createdAt: Date.now(),
        method: 'run',
        pid,
        status: 'running',
        taskfileId,
        taskName,
      })

      this.updateTask({taskfileId, activePID: pid, taskName})
    })
  },

  setActivePID(payload) {
    const validate = t.struct({
      taskfileId: t.String,
      taskName: t.String,
      pid: t.Number,
    })
    validate(payload)

    // example payload = {taskName, activePID}
    this.updateTask({taskName: payload.taskName, activePID: payload.pid})
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
    // example payload = {taskName, activePID}
    this.updateTask(payload)
  },
}

const selectors = {
  taskByIdThenName(state, taskfileId, taskName) {
    const task = state[taskfileId]
    if (!task) return null

    return _.find(task, {name: taskName})
  },
}

/**
 * `taskfiles` is a data structure that holds `taskfile` information keyed by
 * `taskfileId`.
 */
export const taskfiles = {
  state: {}, // {[taskfile.id]: [tasks]}

  reducers: {
    addHistory: handledElsewhere,
    appendLog: handledElsewhere,
    updateHistory: handledElsewhere,

    mergeTasks: producer((draft, payload) => {
      const {taskfileId, tasks} = payload

      let tasksArr = draft[taskfileId]
      if (!tasksArr) {
        tasksArr = []
        draft[taskfileId] = tasksArr
      }

      for (const task of tasks) {
        // facilitates  getting the parent taskfile
        task.taskfileId = taskfileId

        const idx = _.findIndex(tasksArr, {name: task.name})
        if (idx > -1) {
          tasksArr[idx] = {...tasksArr[idx], ...task}
          continue
        }
        tasksArr.push(task)
      }
    }),

    updateTask: producer((draft, payload) => {
      const {taskfileId, taskName, ...rest} = payload
      const tasks = draft[taskfileId]
      const idx = _.findIndex(tasks, {name: taskName})
      if (idx < 0) {
        konsole.error('Could not find task', taskName)
        return
      }
      tasks[idx] = {...tasks[idx], ...rest}
    }),
  },
  effects,
  selectors,
}
