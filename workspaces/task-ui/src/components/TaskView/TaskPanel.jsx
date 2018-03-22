import PropTypes from 'prop-types'
import React, {Component} from 'react'
import Taskfiles from './Taskfiles'

/*
import {connect} from 'react-redux';

const mapDispatch = (ownProps) => ({});

const mapState = (state) => ({});

@connect(mapState, mapDispatch)
*/
class TaskPanel extends Component {
  static propTypes = {
    project: PropTypes.object,
  }

  render() {
    const {project} = this.props

    return (
      <React.Fragment>
        <Taskfiles taskfiles={project.taskfiles} />
      </React.Fragment>
    )
  }
}

export default TaskPanel
