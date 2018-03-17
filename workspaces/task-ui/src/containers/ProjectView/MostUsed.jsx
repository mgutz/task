import React, {PureComponent} from 'react'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, {ListItem} from 'material-ui/List'

export default class MostUsed extends PureComponent {
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
    if (!(histories && histories.length)) return null
    return (
      <List>
        <ListSubheader>Most Used</ListSubheader>
        {this.renderItems(histories)}
      </List>
    )
  }
}
