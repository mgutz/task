import React, {PureComponent} from 'react'
import Taskfile from '../Taskfile'
import PropTypes from 'prop-types'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'

export default class TaskFiles extends PureComponent {
  static propTypes = {
    taskfiles: PropTypes.array,
  }

  renderTaskfiles(taskfiles) {
    if (!taskfiles) return null

    return taskfiles.map((taskfile) => {
      return <Taskfile key={taskfile.id} taskfile={taskfile} />
    })
  }

  render() {
    const {taskfiles} = this.props

    return (
      <List color="inherit">
        <ListSubheader>Task Files</ListSubheader>
        {this.renderTaskfiles(taskfiles)}
      </List>
    )
  }
}
