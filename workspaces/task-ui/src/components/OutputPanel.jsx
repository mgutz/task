import './OutputPanel.css'
import * as _ from 'lodash'
import * as React from 'react'
import JSONView from './JSONView'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {logEntryAt} from '#/store/logs'
import RunInfo from './RunInfo'
import {select} from '@rematch/select'
import OutputStream from './OutputStream'
import {konsole, taskSlug} from '#/util'

import styled from 'styled-components'

const ColumnView = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`
const ExpandRow = styled.div`
  flex: 1 1 auto;
  border-bottom: solid 1px #ddd;
`

const Row = styled.div`
  flex: 0 1 auto;
`

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
    // pid: PropTypes.number,
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
      <ColumnView>
        <Row>
          <RunInfo history={history} />
        </Row>
        <ExpandRow>
          {logIndex && (
            <OutputStream
              logIndex={logIndex}
              task={task}
              onSelect={this.doSelect}
            />
          )}
        </ExpandRow>
        <Row>{logIndex && this.renderOutputDetail(logIndex, selected)}</Row>
      </ColumnView>
    )
  }

  doSelect = (index) => {
    this.setState({selected: index})
  }
}
