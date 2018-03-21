import React from 'react'
import PropTypes from 'prop-types'
import {ListItem, ListItemText, ListItemSecondaryAction} from 'material-ui/List'
import * as strftime from 'strftime'
import ReplayTask from '../ReplayTask'

const Record = ({className, record, onClick}) => {
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

Record.propTypes = {
  className: PropTypes.string,
  record: PropTypes.object.isRequired,
  onClick: PropTypes.func,
}

export default Record
