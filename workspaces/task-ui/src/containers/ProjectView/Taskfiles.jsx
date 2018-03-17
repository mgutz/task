import React, {PureComponent} from 'react'
import TaskfileItem from '#/components/Taskfile'
// import TasksNav from '#/components/TasksNav'
import PropTypes from 'prop-types'
//import {konsole} from '#/util'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'

export default class TaskFiles extends PureComponent {
  static propTypes = {
    taskfiles: PropTypes.array,
  }

  renderTaskfiles(taskfiles) {
    if (!taskfiles) return null

    return taskfiles.map((taskfile) => {
      return <TaskfileItem key={taskfile.id} taskfile={taskfile} />
    })
  }

  render() {
    const {taskfiles} = this.props

    return (
      <List>
        <ListSubheader>Task Files</ListSubheader>
        {this.renderTaskfiles(taskfiles)}
      </List>
    )
  }
}
