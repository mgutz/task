import * as _ from 'lodash'
import * as t from 'tcomb'
import {invoke} from '../services/websocket'
import {konsole} from '#/util'
import producer from './producer'

const logKind = {
  stdout: 0,
  stderr: 1,
}

// Some reducers are listened for in other models but (for now) they still need
// to be defined. This is an identity function.
const handledElsewhere = (state) => state

export const tasks = {
  state: [],

  reducers: {
    addHistory: handledElsewhere,
    appendLog: handledElsewhere,
    updateHistory: handledElsewhere,

    mergeTasks: producer((draft, payload) => {
      for (const task of payload) {
        const idx = _.findIndex(draft, {name: task.name})
        if (idx > -1) {
          draft[idx] = {...draft[idx], ...task}
          continue
        }
        draft.push(task)
      }
    }),

    updateTask: producer((draft, payload) => {
      const {taskName, ...rest} = payload
      const idx = _.findIndex(draft, {name: taskName})
      if (idx < 0) {
        konsole.error('Could not find task', taskName)
        return
      }
      draft[idx] = {...draft[idx], ...rest}
    }),
  },

  // async action creators
  effects: {
    all() {
      invoke('tasks').then((tasks) => {
        this.mergeTasks(tasks)
      })
    },

    //// websocket dispatch these p* events in ./index.js

    // remote proc close event
    pclose(payload) {
      const [taskName, pid, code] = payload
      this.updateHistory({
        taskName,
        pid,
        status: 'closed',
        statusedAt: Date.now(),
        code,
      })
    },

    // remote proc stderr data
    perr(payload) {
      const [taskName, pid, lines] = payload
      this.appendLog({pid, taskName, lines, kind: logKind.stderr})
    },

    // remote proc error event
    perror(payload) {
      const [taskName, pid, error] = payload
      this.updateHistory({taskName, pid, status: 'errored', error})
    },

    // remote proc stdout data
    pout(payload) {
      const [taskName, pid, lines] = payload
      this.appendLog({pid, taskName, lines, kind: logKind.stdout})
    },

    /**
     * Runs a task
     *
     * @param {any[]} args args[0] should be name of method to invoke.
     */
    run(args) {
      return invoke('run', ...args).then((payload) => {
        const {pid} = payload
        const taskName = args[0]
        this.addHistory({
          args,
          createdAt: Date.now(),
          method: 'run',
          pid,
          status: 'running',
          taskName,
        })

        this.updateTask({activePID: pid, taskName})
      })
    },

    setActivePID(payload) {
      const validate = t.struct({
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
  },
}
