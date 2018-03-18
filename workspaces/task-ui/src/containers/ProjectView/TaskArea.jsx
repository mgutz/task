import PropTypes from 'prop-types'
import React, {Component} from 'react'
import Saved from './Saved'
import Taskfiles from './Taskfiles'

/*
import {connect} from 'react-redux';

const mapDispatch = (ownProps) => ({});

const mapState = (state) => ({});

@connect(mapState, mapDispatch)
*/
class TaskArea extends Component {
  static propTypes = {
    project: PropTypes.object,
  }

  render() {
    const {project} = this.props

    return (
      <React.Fragment>
        <Taskfiles taskfiles={project.taskfiles} />
        <Saved bookmarks={project.bookmarks} />
      </React.Fragment>
    )
  }
}

export default TaskArea
