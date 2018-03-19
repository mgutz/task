import React, {Component} from 'react'
import {select} from '@rematch/select'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import History from '#/components/History'

const mapState = (state) => {
  const route = state.router.route
  const {name, params} = route

  if (name.startsWith('tasks')) {
    const task = select.taskfiles.taskByFileIdAndName(
      state,
      params.taskfileId,
      params.taskName
    )
    return {task}
  } else if (name.startsWith('bookmarks')) {
    const bookmark = select.project.bookmarkQuery(state, {id: params.id})
    return {bookmark}
  }

  return {}
}

@connect(mapState)
class RunPanel extends Component {
  static propTypes = {
    bookmark: PropTypes.object,
    task: PropTypes.object,
  }

  render() {
    if (!this.props.task && !this.props.bookmark) return null
    const {bookmark, task} = this.props
    return <History task={task} bookmark={bookmark} />
  }
}

export default RunPanel
