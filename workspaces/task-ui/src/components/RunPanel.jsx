import * as _ from 'lodash'
import React, {Component} from 'react'
import {select} from '@rematch/select'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import History from './History'
import Tabs, {Tab} from 'material-ui/Tabs'
import Bookmarks from './Bookmarks'

const mapState = (state) => {
  return {
    histories: select.histories.all(state),
    //runningHistories: select.histories.runningTasks(state),
    bookmarks: state.project.bookmarks,
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
    bookmarks: PropTypes.array,
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
      {label: 'Bookmarks', render: this.renderBookmarks},
    ]
  }

  renderBookmarks = () => {
    const {bookmarks} = this.props
    return <Bookmarks bookmarks={bookmarks} />
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
