import './HistoryLog.css'
import * as React from 'react'
import JSONView from './JSONView'
import PropTypes from 'prop-types'
import VirtualList from 'react-tiny-virtual-list'
import {connect} from 'react-redux'
import {logEntryAt, logLength} from '#/store/logs'
import HistoryActions from './HistoryActions'
import {select} from '@rematch/select'

// const VirtualList = styled(TinyVirtualList)`
//   font-family: monospace;
//   border-bottom: solid 1px #ccc;
// `

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

  renderList(logIndex) {
    return (
      <VirtualList
        className="task-log"
        ref={this.doSetVirtualList}
        width="100%"
        height={600}
        itemCount={logLength(logIndex)}
        itemSize={20}
        renderItem={this.renderItem}
        scrollToIndex={logLength(logIndex)}
        overscanCount={15}
      />
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
      <div>
        <HistoryActions history={history} />
        {logIndex && this.renderList(logIndex)}
        {logIndex && this.renderSelectedDetail(logIndex, selected)}
      </div>
    )
  }

  doSetVirtualList = (instance) => {
    this.virtualList = instance
  }

  doSelect = (index) => () => {
    this.setState({selected: index}, () => {
      this.virtualList.forceUpdate()
    })
  }
}
