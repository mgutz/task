import * as _ from 'lodash'
import {invoke} from '../services/websocket'
import * as t from 'tcomb'
import producer from './producer'
import {uid} from '#/util'
import {dispatch} from '@rematch/core'

export const project = {
  state: {
    bookmarks: [],
  },

  reducers: {
    addBookmark: producer((draft, payload) => {
      if (!draft.bookmarks) {
        draft.bookmarks = [payload]
        return
      }
      draft.bookmarks.push(payload)
    }),

    updateBookmark: producer((draft, payload) => {
      const {id, ...rest} = payload
      const idx = _.findIndex(draft.bookmarks, {id})
      if (idx < 0) {
        throw new Error(`Bookmark not found, id=${id}`)
      }
      draft.bookmarks[id] = {...draft.bookmarks[id], ...rest}
    }),

    setProject: producer((draft, payload) => {
      return payload
    }),
  },

  effects: {
    loadProject() {
      invoke('task.loadProject').then((res) => {
        this.setProject(res)
        if (res.taskfiles) {
          for (const taskfile of res.taskfiles) {
            dispatch.taskfiles.fetchTasks({taskfileId: taskfile.id})
          }
        }
      })
    },

    saveBookmark({title, record}) {
      const id = uid()
      const scope = 'project'
      const bookmark = {id, record, scope, title}
      this.addBookmark(bookmark)
      invoke('task.addBookmark', bookmark)
    },

    setBookmarkActiveHistory(payload) {
      const validate = t.struct({
        id: t.String,
        historyId: t.String,
      })
      const {id, historyId} = validate(payload)
      this.updateBookmark({id, activeHistoryId: historyId})
    },
  },

  selectors: {
    bookmarkById(state, id) {
      return _.find(state.bookmarks, {id})
    },

    bookmarkQuery(state, query) {
      return _.filter(state.bookmarks, query)
    },
  },
}
