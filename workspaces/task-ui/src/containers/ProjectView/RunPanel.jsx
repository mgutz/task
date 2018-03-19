import React, {Component} from 'react'
import {select} from '@rematch/select'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import History from '#/components/History'
import Tabs, {Tab} from 'material-ui/Tabs'

const mapState = (state) => {
  const route = state.router.route
  const {name, params} = route
  const runningHistories = select.histories.runningTasks(state)

  if (name.startsWith('tasks.name')) {
    const task = select.taskfiles.taskById(state, params.id)
    if (!task) return {}
    return {
      task,
      histories: select.histories.byQuery(state, {refId: task.id}),
      runningHistories,
    }
  } else if (name.startsWith('bookmarks.title')) {
    const bookmark = select.project.bookmarkById(state, params.id)
    if (!bookmark) return {}
    return {
      bookmark,
      histories: select.histories.byQuery(state, {refId: bookmark.id}),
      runningHistories,
    }
  }

  return {}
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

    if (activeTab === 0)
      return <History histories={runningHistories} title={runningTitle} />
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
