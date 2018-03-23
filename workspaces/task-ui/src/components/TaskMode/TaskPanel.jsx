import PropTypes from 'prop-types'
import React, {Component} from 'react'
import Taskfiles from './Taskfiles'

class TaskPanel extends Component {
  static propTypes = {
    project: PropTypes.object,
  }

  render() {
    const {project} = this.props
    return <Taskfiles taskfiles={project.taskfiles} />
  }
}

export default TaskPanel
