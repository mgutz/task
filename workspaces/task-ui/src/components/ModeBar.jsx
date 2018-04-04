import {Activate} from '#/services/router'
import BookmarkIcon from 'material-ui-icons/BookmarkBorder'
import ListIcon from 'material-ui-icons/List'
import SettingsIcon from 'material-ui-icons/Settings'
import IconButton from 'material-ui/IconButton'
import React, {Component} from 'react'
import Box from './Box'

class ModeBar extends Component {
  constructor() {
    super()

    this.modes = [
      {label: 'Tasks', icon: <ListIcon />, routeName: 'tasks'},
      {label: 'Bookmarks', icon: <BookmarkIcon />, routeName: 'bookmarks'},
      {label: 'Settings', icon: <SettingsIcon />, routeName: 'settings'},
    ]
  }

  renderItem = (mode, i) => {
    const route = {
      name: mode.routeName,
    }
    return (
      <Activate class="is-selected" route={route} key={i}>
        <Box shape="rounded" margin="1em 0 0 0">
          <IconButton>{mode.icon}</IconButton>
        </Box>
      </Activate>
    )
  }

  render() {
    return (
      <Box column center margin="1em 0">
        {this.modes.map(this.renderItem)}
      </Box>
    )
  }
}

export default ModeBar
