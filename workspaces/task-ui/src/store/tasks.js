import * as _ from 'lodash'
import {invoke} from '../services/websocket'
import {konsole} from '#/util'
import * as imm from 'dot-prop-immutable'

const logKind = {
  stdout: 0,
  stderr: 1,
}

// Some reducers are listened in other models but (for now) they still need
// to be defined. This is an identity function.
const handledElsewhere = (state) => state

export const tasks = {
  state: [],

  reducers: {
    addHistory: handledElsewhere,
    appendLog: handledElsewhere,
    updateHistory: handledElsewhere,

    mergeTasks: (state, payload) => {
      // TODO properly merge this
      state = payload
      return state
    },

    // status in {'', running, errored, closed}
    updateTask: (state, payload) => {
      const {taskName, ...rest} = payload
      const idx = _.findIndex(state, {name: taskName})
      if (idx < 0) {
        konsole.error('Could not find task', taskName)
        return state
      }
      return imm.set(state, String(idx), {...state[idx], ...rest})
    },
  },

  // async action creators
  effects: {
    all() {
      invoke('tasks').then((tasks) => {
        this.mergeTasks(tasks)
      })
    },

    // remote proc close event
    pclose(payload) {
      const [taskName, pid, code] = payload
      this.updateHistory({taskName, pid, status: 'closed', code})
    },

    // remote proc stderr data
    perr(payload) {
      konsole.log('perr', payload)
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
      konsole.log('pout', payload)
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
          method: 'run',
          pid,
          status: 'running',
          taskName,
        })

        this.updateTask({currentPID: pid, taskName})
      })
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

    updateCurrentPID(payload) {
      // payload = {taskName, currentPID}
      // hold the current pid on the task itself, when any history is clicked
      // the currentPid is changed
      this.updateTask(payload)
    },
  },
}

/*
  proc.stdout.on('data', (data) => {
    client.send('pout', [taskName, proc.pid, data])
  })

  proc.stderr.setEncoding('utf-8')
  proc.stderr.on('data', (data) => {
    client.send('perr', [taskName, proc.pid, data])
  })

  proc.on('close', () => {
    client.send('pclose', [taskName, proc.pid, code])
  })

  proc.on('error', (err) => {
    client.send('perror', [taskName, proc.pid, err])
  })
  */
