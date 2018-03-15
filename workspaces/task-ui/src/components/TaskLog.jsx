import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import styled from 'styled-components'
import VirtualList from 'react-tiny-virtual-list'
import {logEntryAt, logLength} from '#/store/logs'
import './TaskLog.css'
import ReactJSONTree from 'react-json-tree'

// see https://github.com/chriskempson/base16/blob/master/styling.md
//
const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
}

const JSONTree = styled(ReactJSONTree).attrs({
  theme,
})`
  font-family: monospace important!;
  font-size: 10px;
`

// const VirtualList = styled(TinyVirtualList)`
//   font-family: monospace;
//   border-bottom: solid 1px #ccc;
// `

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
      <JSONTree
        data={logEntryAt(logIndex, selected)}
        hideRoot={true}
        sortObjectKeys={true}
      />
    )
  }

  render() {
    const {logIndex} = this.props
    const {selected} = this.state
    if (!logIndex) return null
    return (
      <div>
        {this.renderList(logIndex)}
        {this.renderSelectedDetail(logIndex, selected)}
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
