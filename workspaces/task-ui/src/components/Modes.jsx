import React, {Component} from 'react'
import ListIcon from 'material-ui-icons/List'
import SettingsIcon from 'material-ui-icons/Settings'
import IconButton from 'material-ui/IconButton'
import {Activate} from '#/services/router'
import Box from './Box'

class Modes extends Component {
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
        <Box>
          <IconButton>{mode.icon}</IconButton>
        </Box>
      </Activate>
    )
  }

  render() {
    return (
      <Box flexDirection="column" alignItems="center">
        {this.modes.map(this.renderItem)}
      </Box>
    )
  }
}

export default Modes
