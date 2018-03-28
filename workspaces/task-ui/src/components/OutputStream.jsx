import * as _ from 'lodash'
import React, {Component} from 'react'
import {AutoSizer, List} from 'react-virtualized'
import {logEntryAt, logLength} from '#/store/logs'
import PropTypes from 'prop-types'
import Ansi from 'ansi-to-react'
import VirtualList from 'react-tiny-virtual-list'

class OutputStream extends Component {
  static propTypes = {
    historyId: PropTypes.string.isRequired,
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
    if (nextProps.historyId && nextProps.historyId !== this.props.historyId) {
      console.log('SWITCHING OUTPUT TO', nextProps.historyId)
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

    console.log('renderitem', index)

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
        {str}
        {/* <Ansi>{str}</Ansi> */}
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

    return (
      <AutoSizer>
        {({height, width}) => {
          return (
            <div onKeyDown={this.doKeyDown} tabIndex="0">
              <VirtualList
                ref={this.doSetVirtualList}
                width={width}
                height={height}
                itemCount={max}
                itemSize={20} // Also supports variable heights (array or function getter)
                renderItem={this.renderItem}
                onItemsRendered={this.doSetRowsRendered}
              />
            </div>
          )
        }}
      </AutoSizer>
    )
  }

  render3() {
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
                scrolltoAlignment="start"
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
    const {startIndex, stopIndex} = this.rowsRendered
    if (startIndex === undefined) {
      this.rowsRendered = props
      return
    }

    if (startIndex < props.startIndex && stopIndex > props.startIndex) {
      for (let i = 0; i < props.startIndex - startIndex; i++) {
        delete this.itemsCache[startIndex + i]
      }
    } else if (props.startIndex < startIndex && props.stopIndex > startIndex) {
      for (let i = 0; i < startIndex - props.startIndex; i++) {
        delete this.itemsCache[props.stopIndex + i + 1]
      }
    } else if (startIndex !== props.startIndex) {
      // no overlap so delete all existing items
      for (let i = startIndex; i <= stopIndex; i++) {
        delete this.itemsCache[i]
      }
    }

    this.rowsRendered = props
  }

  doSetVirtualList = (instance) => {
    this.virtualList = instance
  }

  propsSelect = _.debounce((index) => {
    this.props.onSelect(index)
  }, 150)

  updateGrid2 = _.debounce(() => {
    this.virtualList.forceUpdateGrid()
  }, 100)

  updateGrid = _.debounce(() => {
    this.virtualList.forceUpdate()
  }, 16)

  innerSelect = (index) => {
    this.setState({selected: index})
    this.updateGrid()
    this.propsSelect(index)
  }
}

export default OutputStream
