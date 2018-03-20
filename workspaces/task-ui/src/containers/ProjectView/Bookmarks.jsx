import React, {PureComponent} from 'react'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, {ListItemIcon, ListItem, ListItemText} from 'material-ui/List'
//import BoomarkBorderIcon from 'material-ui-icons/BookmarkBorder'
import ReplayBookmark from '#/components/ReplayBookmark'
import {connect} from 'react-redux'
import {bookmarkSlug} from '#/util'

const mapState = (state) => {
  const {route} = state.router
  return {
    route,
  }
}

const mapDispatch = ({router: {navigate}}) => ({navigate})

@connect(mapState, mapDispatch)
export default class TaskFiles extends PureComponent {
  static propTypes = {
    bookmarks: PropTypes.array,
    navigate: PropTypes.func,
    route: PropTypes.object,
  }

  renderItems(route, bookmarks) {
    if (!bookmarks) return null

    const {name, params} = route

    return bookmarks.map((bookmark) => {
      const isActive =
        name.startsWith('bookmarks.title') && params.id === bookmark.id
      const classes = isActive ? 'is-selected' : ''
      const onClick = isActive ? null : this.doSetActive(bookmark)

      return (
        <ListItem className={classes} key={bookmark.id} onClick={onClick}>
          {/* <ListItemIcon>
            <BoomarkBorderIcon />
          </ListItemIcon> */}
          <ListItemText primary={bookmark.title} />
          <ListItemIcon>
            <ReplayBookmark bookmark={bookmark} />
          </ListItemIcon>
        </ListItem>
      )
    })
  }

  render() {
    const {bookmarks, route} = this.props
    return (
      <List>
        <ListSubheader>Bookmarks</ListSubheader>
        {this.renderItems(route, bookmarks)}
      </List>
    )
  }

  doSetActive = (bookmark) => () => {
    const {navigate} = this.props
    navigate({
      name: 'bookmarks.title',
      params: {id: bookmark.id, title: bookmarkSlug(bookmark)},
    })
  }
}
