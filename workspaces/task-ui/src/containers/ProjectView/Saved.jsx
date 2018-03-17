import React, {PureComponent} from 'react'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import ListSubheader from 'material-ui/List/ListSubheader'
import List, {ListItemIcon, ListItem, ListItemText} from 'material-ui/List'
import BoomarkBorderIcon from 'material-ui-icons/BookmarkBorder'
import RerunSaved from '#/components/RerunSaved'

export default class TaskFiles extends PureComponent {
  static propTypes = {
    histories: PropTypes.array,
  }

  renderItems(histories) {
    if (!histories) return null

    return histories.map((history) => {
      return (
        <ListItem key={history.id}>
          <ListItemIcon>
            <BoomarkBorderIcon />
          </ListItemIcon>
          <ListItemText primary={history.title} />
          <ListItemIcon>
            <RerunSaved history={history} />
          </ListItemIcon>
        </ListItem>
      )
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
