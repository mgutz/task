import React, {Component} from 'react'
import {select} from '@rematch/select'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import History from '#/components/History'

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
    const saved = select.project.savedById(state, params.saveId)
    return {saved}
  }

  return {}
}

@connect(mapState)
class HistoryArea extends Component {
  render() {
    if (!this.props.task) return null
    const {saved, task} = this.props

    return <History task={task} saved={saved} />
  }
}

HistoryArea.propTypes = {
  saved: PropTypes.object,
  task: PropTypes.object,
}

export default HistoryArea
