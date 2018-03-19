import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {select} from '@rematch/select'

const mapState = (state) => {
  return {
    tasks: select.histories.runningTasks(state),
  }
}

@connect(mapState)
class RunningTasks extends Component {
  static propTypes = {
    tasks: PropTypes.array,
  }

  render() {
    return <div />
  }
}

export default RunningTasks
