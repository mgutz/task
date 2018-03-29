import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {ListItem, ListItemText, ListItemSecondaryAction} from 'material-ui/List'
import * as strftime from 'strftime'
import ReplayTask from '../ReplayTask'
import {connect} from 'react-redux'

const mapDispatch = ({histories: {attach}}) => ({attach})

@connect(null, mapDispatch)
class Record extends PureComponent {
  static propTypes = {
    attach: PropTypes.func.isRequired,
    className: PropTypes.string,
    record: PropTypes.object.isRequired,
    onClick: PropTypes.func,
  }

  componentDidMount() {
    const {attach, record} = this.props
    const {attached, logFile, id, status} = record
    if (status === 'running' && !attached) {
      console.log('RECORD', record)
      attach({logFile, historyId: id})
    }
  }

  render() {
    const {className, record, onClick} = this.props

    if (!record) return null

    const olderThanOneDay = Date.now() - record.createdAt > 24 * 60 * 60 * 1000
    const dayFormat = '%F %I:%M:%S %p'
    const hourFormat = '%I:%M:%S %p'
    const format = olderThanOneDay ? dayFormat : hourFormat

    let status = strftime(format, new Date(record.createdAt))
    if (record.status === 'closed') {
      status += ' for ' + (record.statusedAt - record.createdAt) + 'ms'
    }

    const caption = record.ref.title

    return (
      <ListItem className={className} key={record.id} onClick={onClick}>
        <ListItemText primary={caption} secondary={status} />
        <ListItemSecondaryAction>
          <ReplayTask record={record} />
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}

export default Record
