import * as _ from 'lodash'
import {konsole} from '#/util'
import producer from '../producer'
import {effects} from './effects'

// Some reducers are listened for in other models but (for now) they still need
// to be defined. This is an identity function.
const handledElsewhere = (state) => state

/**
 * `taskfiles` is a data structure that holds `taskfile` information keyed by
 * `taskfileId`.
 */
export const taskfiles = {
  state: {}, // {[taskfile.id]: [task1, task2, ..., taskN]}

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

  selectors: {
    taskByIdThenName(state, taskfileId, taskName) {
      const taskfile = state[taskfileId]
      if (!taskfile) return null

      const found = _.find(taskfile, {name: taskName})
      return found
    },
  },
}
