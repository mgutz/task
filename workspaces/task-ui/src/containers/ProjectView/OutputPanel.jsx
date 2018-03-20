import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {select} from '@rematch/select'
import RealOutputPanel from '#/components/OutputPanel'

const mapState = (state) => {
  const route = state.router.route
  const {name, params} = route

  // The output panel is always tied to history
  if (!params.historyId) return {}

  if (name.startsWith('tasks')) {
    const task = select.taskfiles.taskById(state, params.id)
    return {task, historyId: params.historyId}
  } else if (name.startsWith('bookmarks')) {
    // TODO this should be in selector but selectors in rematch only handle
    // model state not root state

    // NOTE: bookmarks don't have task ids because task ids are assigned
    // at run-time when tasks are loaded. A bookmark has taskfileId and taskName
    const bookmark = select.project.bookmarkById(state, params.id)
    const task = select.taskfiles.taskByFileIdAndName(
      state,
      bookmark.taskfileId,
      bookmark.taskName
    )
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
    return <RealOutputPanel historyId={historyId} task={task} />
  }
}

export default OutputPanel
