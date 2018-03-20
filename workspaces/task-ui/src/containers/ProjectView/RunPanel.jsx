import React, {Component} from 'react'
import {select} from '@rematch/select'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import History from '#/components/History'
import Tabs, {Tab} from 'material-ui/Tabs'
import ProcessTools from '#/components/ProcessTools'

const mapState = (state) => {
  return {
    histories: select.histories.all(state),
    runningHistories: select.histories.runningTasks(state),
  }
}

@connect(mapState)
class RunPanel extends Component {
  static propTypes = {
    bookmark: PropTypes.object,
    histories: PropTypes.array,
    runningHistories: PropTypes.array,
    task: PropTypes.object,
  }

  state = {
    activeTab: 0,
  }

  renderHistories() {
    const {histories, runningHistories} = this.props
    const {activeTab} = this.state
    const historiesTitle =
      histories && histories.length ? 'History' : 'No History'
    const runningTitle =
      runningHistories && runningHistories.length
        ? 'Running Tasks'
        : 'No Running Tasks'

    if (activeTab === 0) {
      return (
        <React.Fragment>
          <ProcessTools />
          <History histories={runningHistories} title={runningTitle} />
        </React.Fragment>
      )
    }

    return <History histories={histories} title={historiesTitle} />
  }

  render() {
    return (
      <React.Fragment>
        <Tabs
          value={this.state.activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.doSetActive}
        >
          <Tab label="Running" style={{minWidth: 0}} />
          <Tab label="History" style={{minWidth: 0}} />
        </Tabs>

        {this.renderHistories()}
      </React.Fragment>
    )
  }

  doSetActive = (e, activeTab) => {
    this.setState({activeTab})
  }
}

export default RunPanel
