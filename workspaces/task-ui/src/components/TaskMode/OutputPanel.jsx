import _ from 'lodash'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {select} from '@rematch/select'
import RealOutputPanel from '../OutputPanel'

const mapState = (state) => {
  const route = state.router.route
  const {name, params} = route

  // The output panel is always tied to history
  if (!params.historyId) return {}

  let task
  if (name.startsWith('tasks')) {
    task = select.taskfiles.taskById(state, params.id)
    return {task, historyId: params.historyId}
  } else if (name.startsWith('bookmarks')) {
    // TODO this should be in selector but selectors in rematch only handle
    // model state not root state

    // NOTE: bookmarks don't have task ids because task ids are assigned
    // at run-time when tasks are loaded. A bookmark has taskfileId and taskName
    const bookmark = select.project.bookmarkById(state, params.id)
    const taskId = _.get(bookmark, 'record.ref.id')
    task = taskId ? select.taskfiles.taskById(state, taskId) : null
    return {task, historyId: params.historyId}
  }

  return {}
}

@connect(mapState)
class OutputPanel extends Component {
  static propTypes = {
    bookmark: PropTypes.object,
    historyId: PropTypes.string,
    task: PropTypes.object,
  }

  render() {
    const {historyId, task} = this.props
    if (!task) return null
    return <RealOutputPanel historyId={historyId} task={task} />
  }
}

export default OutputPanel
