import React, {Component} from 'react'
import ListIcon from 'material-ui-icons/List'
import SettingsIcon from 'material-ui-icons/Settings'
import Flex, {FlexItem} from 'styled-flex-component'
import IconButton from 'material-ui/IconButton'
import Activate from './Activate'

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
        <FlexItem className="foo">
          <IconButton>{mode.icon}</IconButton>
        </FlexItem>
      </Activate>
    )
  }

  render() {
    return (
      <Flex center column>
        {this.modes.map(this.renderItem)}
      </Flex>
    )
  }
}

export default Modes
