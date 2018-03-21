import React, {Component} from 'react'
import {AutoSizer, List} from 'react-virtualized'
import {logEntryAt, logLength} from '#/store/logs'
import PropTypes from 'prop-types'

class OutputStream extends Component {
  static propTypes = {
    logIndex: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    messageProp: PropTypes.string, // property name  of message in json objects
    task: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      selected: -1,
      max: props.logIndex ? logLength(props.logIndex) : 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.logIndex && nextProps.logIndex !== this.props.logIndex) {
      const max = logLength(nextProps.logIndex)
      this.setState({selected: max - 1, max})
      this.props.onSelect(max - 1)
    }
  }

  renderItem = ({index, style}) => {
    const {logIndex, task} = this.props
    const {selected} = this.state
    // eslint-disable-next-line
    const o = logEntryAt(logIndex, index)

    let str
    if (o._msg_) {
      str = o._msg_
    } else if (task.formatLog) {
      try {
        str = task.formatLog(o)
      } catch (err) {
        // do nothing
      }
    }
    if (!str) str = JSON.stringify(o)

    // TODO show message if no str
    // if (!str) str = JSON.stringify(o)

    const classes =
      selected === index ? 'task-entry is-entry-selected' : 'task-entry'
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

  render() {
    const {logIndex} = this.props
    const {selected} = this.state
    const max = logLength(logIndex)

    return (
      <AutoSizer>
        {({height, width}) => {
          return (
            <div onKeyDown={this.doKeyDown} tabIndex="0">
              <List
                ref={this.doSetVirtualList}
                className="task-log"
                height={height}
                overscanRowCount={10}
                // noRowsRenderer={this._noRowsRenderer}
                rowCount={max}
                rowHeight={20}
                rowRenderer={this.renderItem}
                scrollToIndex={selected}
                width={width}
              />
            </div>
          )
        }}
      </AutoSizer>
    )
  }

  doKeyDown = (e) => {
    const {selected, max} = this.state
    // reversed visually so moving up decreases, moving down increases
    if (e.key === 'ArrowUp') {
      if (selected > 0) this.innerSelect(selected - 1)
    } else if (e.key === 'ArrowDown') {
      if (selected + 1 < max) this.innerSelect(selected + 1)
    }
  }

  doSelect = (index) => () => {
    this.innerSelect(index)
  }

  doSetVirtualList = (instance) => {
    this.virtualList = instance
  }

  innerSelect = (index) => {
    this.setState({selected: index}, () => {
      this.virtualList.forceUpdateGrid()
      this.props.onSelect(index)
    })
  }
}

export default OutputStream