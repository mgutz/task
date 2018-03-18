import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {select} from '@rematch/select'
import HistoryLog from '#/components/HistoryLog'

/*

const mapDispatch = (ownProps) => ({});

const mapState = (state) => ({});

@connect(mapState, mapDispatch)
*/

const mapState = (state) => {
  const route = state.router.route
  const {name, params} = route

  if (name.startsWith('tasks')) {
    const task = select.taskfiles.taskByFileIdAndName(
      state,
      params.taskfileId,
      params.taskName
    )
    return {task, historyId: params.historyId}
  } else if (name.startsWith('bookmarks')) {
    const bookmark = select.project.bookmarkQuery(state, {id: params.id})
    return {bookmark, historyId: params.historyId}
  }

  return {}
}

@connect(mapState)
class OutputArea extends Component {
  render() {
    const {bookmark, historyId, task} = this.props
    return <HistoryLog historyId={historyId} task={task} bookmark={bookmark} />
  }
}

OutputArea.propTypes = {
  bookmark: PropTypes.object,
  historyId: PropTypes.string,
  task: PropTypes.object,
}

export default OutputArea
