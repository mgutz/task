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
  state: {
    taskfiles: {},
    tasks: [],
  },

  reducers: {
    addHistory: handledElsewhere,
    appendLog: handledElsewhere,
    updateHistory: handledElsewhere,

    mergeTasks: producer((draft, payload) => {
      const {taskfileId, tasks} = payload
      let tasksArr = draft.taskfiles[taskfileId]
      if (!tasksArr) {
        tasksArr = []
        draft.taskfiles[taskfileId] = tasksArr
      }

      for (const task of tasks) {
        const idx = tasksArr.indexOf(task.id)

        // not found, add to taskfiles and tasks
        if (idx < 0) {
          tasksArr.push(task.id)
          draft.tasks.push(task)
        }
      }
    }),

    updateTask: producer((draft, payload) => {
      const {id, ...rest} = payload
      const idx = _.findIndex(draft.tasks, {id})
      if (idx < 0) {
        konsole.error('Could not find task by id', id)
        return
      }

      draft.tasks[idx] = {...draft.tasks[idx], ...rest}
    }),
  },

  effects,

  selectors: {
    taskByFileIdAndName(state, taskfileId, name) {
      return _.find(state.tasks, {taskfileId, name})
    },

    tasksByFileId(state, taskfileId) {
      const ids = state.taskfiles[taskfileId]
      if (!Array.isArray(ids)) return
      return ids.map((id) => _.find(state.tasks, {id}))
    },
  },
}
