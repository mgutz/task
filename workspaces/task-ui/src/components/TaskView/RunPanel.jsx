import React, {Component} from 'react'
import {select} from '@rematch/select'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import History from '../History'
import Tabs, {Tab} from 'material-ui/Tabs'

const mapState = (state) => {
  return {
    histories: select.histories.all(state),
    runningHistories: select.histories.runningTasks(state),
  }
}

const styles = {
  tab: {
    width: '33%',
    minWidth: '0',
  },
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

  constructor() {
    super()
    this.activeTabs = [
      {label: 'History', render: this.renderHistories},
      {label: 'Running', render: this.renderRunning},
      // this.renderFind,
    ]
  }

  renderHistories = () => {
    const {histories} = this.props
    // const historiesTitle =
    //   histories && histories.length ? 'History' : 'No History'
    return <History histories={histories} />
  }

  renderRunning = () => {
    const {runningHistories} = this.props
    // const runningTitle =
    //   runningHistories && runningHistories.length
    //     ? 'Running Tasks'
    //     : 'No Running Tasks'
    return <History histories={runningHistories} />
  }

  render() {
    const {activeTab} = this.state

    return (
      <React.Fragment>
        <Tabs
          value={activeTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.doSetActive}
        >
          {this.activeTabs.map(({label}) => (
            <Tab key={label} label={label} style={styles.tab} />
          ))}
        </Tabs>
        {this.activeTabs[activeTab].render()}
      </React.Fragment>
    )
  }

  doSetActive = (e, activeTab) => {
    this.setState({activeTab})
  }
}

export default RunPanel
