import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import styled from 'styled-components'
import VirtualList from 'react-tiny-virtual-list'
import {logEntryAt, logLength} from '#/store/logs'
import './TaskLog.css'

const ListView = styled.div`
  font-family: monospace;
  height: 500px;
`

const ItemView = styled.div`
  height: 100%;
`

const mapState = (state, props) => {
  const {task} = props
  return {
    logIndex: state.logs[task.activePID],
  }
}

@connect(mapState)
export default class TaskLog extends React.PureComponent {
  static propTypes = {
    pid: PropTypes.number,
    logIndex: PropTypes.object,
  }

  renderList(logIndex) {
    return (
      <VirtualList
        width="100%"
        height={400}
        itemCount={logLength(logIndex)}
        itemSize={24}
        renderItem={this.renderItem}
      />
    )
  }

  renderItem = ({index, style}) => {
    const {logIndex} = this.props
    // eslint-disable-next-line
    const o = logEntryAt(logIndex, index)
    // TODO these keys should be user configurable
    let str = o.m || o.msg
    if (str === undefined || str === '') {
      return null
    }
    if (!str) str = JSON.stringify(o)

    const classes = o._kind_ === 0 ? 'task-kind' : 'task-kind task-kind-err'
    const lineClasses =
      o._kind_ === 0 ? 'task-entry' : 'task-entry task-entry-err'

    return (
      <div key={index} style={style}>
        <span className={classes}>{o._kind_ === 0 ? 'out' : 'err'}</span>
        <span className={lineClasses}>{str}</span>
      </div>
    )
  }

  render() {
    const {logIndex} = this.props
    if (!logIndex) return null
    return (
      <div>
        <ListView>{this.renderList(logIndex)}</ListView>
        <ItemView />
      </div>
    )
  }
}
