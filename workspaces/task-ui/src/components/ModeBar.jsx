import React, {Component} from 'react'
import ListIcon from 'material-ui-icons/List'
import SettingsIcon from 'material-ui-icons/Settings'
import IconButton from 'material-ui/IconButton'
import {Activate} from '#/services/router'
import Box from './Box'

class ModeBar extends Component {
  constructor() {
    super()

    this.modes = [
      {label: 'Tasks', icon: <ListIcon />, routeName: 'tasks'},
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
