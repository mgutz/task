import * as _ from 'lodash'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {select} from '@rematch/select'
import Box from './Box'
import History from './History'
import {TopToolbar} from './styled'

const mapState = (state) => {
  return {
    histories: select.histories.all(state),
    //runningHistories: select.histories.runningTasks(state),
    //bookmarks: state.project.bookmarks,
  }
}

@connect(mapState)
class HistoryPanel extends Component {
  static propTypes = {
    // bookmark: PropTypes.object,
    // bookmarks: PropTypes.array,
    histories: PropTypes.array,
    // runningHistories: PropTypes.array,
    task: PropTypes.object,
  }

  renderHistories = () => {
    const {histories: records} = this.props
    const list = records.slice(0).reverse()
    const running = _.filter(list, {status: 'running'}) || []
    const notRunning = _.filter(list, (r) => r.status !== 'running') || []
    const ordered = [...running, ...notRunning]
    return <History records={ordered} />
  }

  render() {
    return (
      <Box column>
        <Box>
          <TopToolbar />
        </Box>
        <Box flex="1 0 0" overflowY="scroll">
          {this.renderHistories()}
        </Box>
      </Box>
    )
  }
}

export default HistoryPanel
