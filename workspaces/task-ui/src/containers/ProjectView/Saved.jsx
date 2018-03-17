import React, {PureComponent} from 'react'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, {ListItem} from 'material-ui/List'

export default class TaskFiles extends PureComponent {
  static propTypes = {
    histories: PropTypes.array,
  }

  renderItems(histories) {
    if (!histories) return null

    return histories.map((history) => {
      return <ListItem key={history.id}>{history.id}</ListItem>
    })
  }

  render() {
    const {histories} = this.props
    return (
      <List>
        <ListSubheader>Saved</ListSubheader>
        {this.renderItems(histories)}
      </List>
    )
  }
}
