import './OutputPanel.css'
import * as React from 'react'
import JSONView from './JSONView'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {logEntryAt} from '#/store/logs'
import RunInfo from './RunInfo'
import {select} from '@rematch/select'
import OutputStream from './OutputStream'
import Box from './Box'

const mapState = (state, props) => {
  const {historyId} = props
  return {
    logIndex: state.logs[historyId],
    history: select.histories.oneById(state, {id: historyId}),
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
          {logIndex && (
            <OutputStream
              logIndex={logIndex}
              task={task}
              onSelect={this.doSelect}
            />
          )}
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
