import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, {ListItemIcon, ListItem, ListItemText} from 'material-ui/List'
import ReplayBookmark from '../ReplayBookmark'
import {bookmarkSlug} from '#/util'
import Activate from '../Activate'

export default class TaskFiles extends PureComponent {
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
    return (
      <List>
        <ListSubheader>Bookmarks</ListSubheader>
        {this.renderItems(bookmarks)}
      </List>
    )
  }
}
