import * as _ from 'lodash'
import {invoke} from '../services/websocket'
import * as t from 'tcomb'
import producer from './producer'
import {uid} from '#/util'

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
      invoke('loadProject').then(this.setProject)
    },

    saveBookmark(payload) {
      const validate = t.struct({
        title: t.String,
        history: t.Object,
      })
      const {history, title} = validate(payload)

      const id = uid()
      const scope = 'project'
      const bookmark = {...history, ...{id, scope, title}}
      this.addBookmark(bookmark)
      invoke('addBookmark', bookmark)
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
