import './OutputPanel.css'
import * as React from 'react'
import JSONView from './JSONView'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {logEntryAt} from '#/store/logs'
import RunInfo from './RunInfo'
import OutputStream from './OutputStream'
import Box from './Box'
import {createSelector} from 'reselect'

const historyIdSelector = (state, props) => props.historyId
const logsSelector = (state) => state.logs
const historiesSelector = (state) => state.histories

const logIndexSelector = createSelector(
  logsSelector,
  historyIdSelector,
  (logs, historyId) => logs[historyId]
)

const historySelector = createSelector(
  historiesSelector,
  historyIdSelector,
  (histories, historyId) => histories[historyId]
)

const mapState = (state, props) => {
  return {
    logIndex: logIndexSelector(state, props),
    history: historySelector(state, props),
  }
}

@connect(mapState)
export default class OutputPanel extends React.PureComponent {
  static propTypes = {
    history: PropTypes.object,
    historyId: PropTypes.string,
    logIndex: PropTypes.object,
    task: PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {selected: -1}
  }

  state = {
    selected: -1,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.historyId !== this.props.historyId) {
      this.setState({selected: -1})
    }
  }

  renderOutputDetail(logIndex, selected) {
    if (selected < 0) return null
    return (
      <JSONView
        data={logEntryAt(logIndex, selected)}
        hideRoot={true}
        sortObjectKeys={true}
      />
    )
  }

  render() {
    const {history, logIndex, task} = this.props
    const {selected} = this.state

    if (!history) return null

    return (
      <Box flexDirection="column" height="100%">
        <Box>
          <RunInfo record={history} />
        </Box>
        <Box flex="1">
          <OutputStream
            logIndex={logIndex}
            task={task}
            onSelect={this.doSelect}
            historyId={history.id}
          />
        </Box>
        <Box height="25vh">
          {logIndex && this.renderOutputDetail(logIndex, selected)}
        </Box>
      </Box>
    )
  }

  doSelect = (index) => {
    this.setState({selected: index})
  }
}
