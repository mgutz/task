import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {select} from '@rematch/select'
import TaskLog from '#/components/TaskLog'

/*

const mapDispatch = (ownProps) => ({});

const mapState = (state) => ({});

@connect(mapState, mapDispatch)
*/

const mapState = (state) => {
  const route = state.router.route
  const {name, params} = route

  if (name.startsWith('tasks')) {
    const task = select.taskfiles.taskByIdThenName(
      state,
      params.taskfileId,
      params.taskName
    )
    return {task}
  } else if (name.startsWith('saved')) {
  }

  return {}
}

@connect(mapState)
class OutputArea extends Component {
  render() {
    if (!this.props.task) return null
    const {task} = this.props
    return <TaskLog task={task} />
  }
}

OutputArea.propTypes = {
  task: PropTypes.object,
}

export default OutputArea
