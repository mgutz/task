import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import List, {ListItemIcon, ListItem, ListItemText} from 'material-ui/List'
import ReplayBookmark from './ReplayBookmark'
import {bookmarkSlug} from '#/util'
import {Activate} from '#/services/router'

export default class Bookmarks extends PureComponent {
  static propTypes = {
    bookmarks: PropTypes.array,
  }

  renderItems(bookmarks) {
    if (!bookmarks) return null

    return bookmarks.map((bookmark) => {
      const route = {
        name: 'bookmarks.title',
        params: {id: bookmark.id, title: bookmarkSlug(bookmark)},
      }

      return (
        <Activate key={bookmark.id} class="is-selected" route={route}>
          <ListItem>
            <ListItemText primary={bookmark.title} />
            <ListItemIcon>
              <ReplayBookmark bookmark={bookmark} />
            </ListItemIcon>
          </ListItem>
        </Activate>
      )
    })
  }

  render() {
    const {bookmarks} = this.props
    return <List>{this.renderItems(bookmarks)}</List>
  }
}
