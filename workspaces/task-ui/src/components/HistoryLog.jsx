import './HistoryLog.css'
import * as React from 'react'
import JSONView from './JSONView'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {logEntryAt, logLength} from '#/store/logs'
import HistoryActions from './HistoryActions'
import {select} from '@rematch/select'
import {AutoSizer, List} from 'react-virtualized'

import styled from 'styled-components'

const ColumnView = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`
const ExpandRow = styled.div`
  flex: 1 1 auto;
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
export default class HistoryLog extends React.PureComponent {
  static propTypes = {
    history: PropTypes.object,
    logIndex: PropTypes.object,
    // pid: PropTypes.number,
    task: PropTypes.object,
  }

  constructor() {
    super()
    this.state = {selected: -1}
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.logIndex && nextProps.logIndex !== this.props.logIndex) {
      const max = logLength(nextProps.logIndex)
      this.setState({selected: max - 1})
    }
  }

  renderList(logIndex) {
    const max = logLength(logIndex)
    return (
      <AutoSizer>
        {({height, width}) => {
          return (
            <List
              ref={this.doSetVirtualList}
              className="task-log"
              height={height}
              overscanRowCount={10}
              // noRowsRenderer={this._noRowsRenderer}
              rowCount={max}
              rowHeight={20}
              rowRenderer={this.renderItem}
              scrollToIndex={max}
              width={width}
            />
          )
        }}
      </AutoSizer>
    )
  }

  renderItem = ({index, style}) => {
    const {logIndex} = this.props
    const {selected} = this.state
    // eslint-disable-next-line
    const o = logEntryAt(logIndex, index)
    // TODO these keys should be user configurable
    let str = o._msg_ || o.msg
    if (str === undefined || str === '') {
      return null
    }
    if (!str) str = JSON.stringify(o)

    const classes = selected === index ? 'task-entry is-selected' : 'task-entry'
    const lineClasses =
      o._kind_ === 0 ? 'task-message' : 'task-message task-message-err'

    //<div className={classes}>{o._kind_ === 0 ? 'out' : 'err'}</div>
    return (
      <div
        className={classes}
        key={index}
        onClick={this.doSelect(index)}
        style={style}
      >
        <div className={lineClasses}>{str}</div>
      </div>
    )
  }

  renderSelectedDetail(logIndex, selected) {
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
    const {history, logIndex} = this.props
    const {selected} = this.state

    return (
      <ColumnView>
        <Row>
          <HistoryActions history={history} />
        </Row>
        <ExpandRow>{logIndex && this.renderList(logIndex)}</ExpandRow>
        <Row>{logIndex && this.renderSelectedDetail(logIndex, selected)}</Row>
      </ColumnView>
    )
  }

  doSetVirtualList = (instance) => {
    this.virtualList = instance
  }

  doSelect = (index) => () => {
    this.setState({selected: index}, () => {
      this.virtualList.forceUpdateGrid()
    })
  }
}
