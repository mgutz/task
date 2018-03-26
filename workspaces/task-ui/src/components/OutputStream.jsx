import * as _ from 'lodash'
import React, {Component} from 'react'
import {AutoSizer, List} from 'react-virtualized'
import {logEntryAt, logLength} from '#/store/logs'
import PropTypes from 'prop-types'
import Ansi from 'ansi-to-react'

class OutputStream extends Component {
  static propTypes = {
    logIndex: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    task: PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      selected: -1,
      max: props.logIndex ? logLength(props.logIndex) : 0,
    }

    this.itemsCache = {}
    this.rowsRendered = {}
  }

  shouldComponentUpdate() {
    return true
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.logIndex && nextProps.logIndex !== this.props.logIndex) {
      const max = logLength(nextProps.logIndex)
      this.setState({selected: -1, max})
      this.itemsCache = {}
      this.rowsRendered = {}
      //this.props.onSelect(max - 1)
    }
  }

  renderItem = (props) => {
    const {index, style} = props
    const {selected} = this.state
    const indexKey = String(index)
    const selectedClassName = 'task-entry is-entry-selected'

    const cached = this.itemsCache[indexKey]
    if (cached) {
      if (selected === index) {
        return React.cloneElement(cached, {
          className: selectedClassName,
        })
      }
      return this.itemsCache[indexKey]
    }

    const {logIndex, task} = this.props
    // eslint-disable-next-line
    const o = logEntryAt(logIndex, index)

    let str
    if (o._msg_ !== undefined) {
      str = o._msg_
    } else if (task.formatLog) {
      try {
        str = task.formatLog(o)
      } catch (err) {
        str = JSON.stringify(o)
      }
    } else {
      str = JSON.stringify(o)
    }

    const classes = selected === index ? selectedClassName : 'task-entry'

    const result = (
      <div
        className={classes}
        key={index}
        onClick={this.doSelect(index)}
        style={style}
      >
        <Ansi>{str}</Ansi>
      </div>
    )

    if (selected !== index) {
      this.itemsCache[indexKey] = result
    }
    return result
  }

  render() {
    const {logIndex, task} = this.props
    const max = logLength(logIndex)
    const {selected} = this.state

    const result = (
      <AutoSizer>
        {({height, width}) => {
          return (
            <div onKeyDown={this.doKeyDown} tabIndex="0">
              <List
                id={task.id}
                ref={this.doSetVirtualList}
                className="task-log"
                height={height}
                overscanRowCount={10}
                noRowsRenderer={this.noRows}
                rowCount={max}
                rowHeight={20}
                rowRenderer={this.renderItem}
                scrollToIndex={selected}
                width={width}
                onRowsRendered={this.doSetRowsRendered}
              />
            </div>
          )
        }}
      </AutoSizer>
    )
    return result
  }

  noRows = () => 'no rows'

  doKeyDown = (e) => {
    const {selected, max} = this.state
    // reversed visually so moving up decreases, moving down increases
    if (e.key === 'ArrowUp') {
      if (selected > 0) this.innerSelect(selected - 1)
      e.preventDefault()
    } else if (e.key === 'ArrowDown') {
      if (selected + 1 < max) this.innerSelect(selected + 1)
      e.preventDefault()
    }
  }

  doSelect = (index) => () => {
    this.innerSelect(index)
  }

  doSetRowsRendered = (props) => {
    if (props.startIndex !== this.rowsRendered.startIndex) {
      //this.itemsCache = {}
    }

    this.rowsRendered = props
  }

  doSetVirtualList = (instance) => {
    this.virtualList = instance
  }

  propsSelect = _.debounce((index) => {
    this.props.onSelect(index)
  }, 150)

  updateGrid = _.debounce(() => {
    this.virtualList.forceUpdateGrid()
  }, 100)

  innerSelect = (index) => {
    this.setState({selected: index})
    this.updateGrid()
    this.propsSelect(index)
  }
}

export default OutputStream
