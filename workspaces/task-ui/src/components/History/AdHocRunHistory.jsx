import * as _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'
import {ListItem, ListItemText, ListItemSecondaryAction} from 'material-ui/List'

import * as strftime from 'strftime'
import ReplayTask from '../ReplayTask'

const AdHocRunHistory = ({className, history, onClick}) => {
  if (_.get(history, 'kind') !== 'run') return null

  const status =
    `pid: ${history.pid} ` +
    (history.status === 'running'
      ? ''
      : 'for: ' + (history.statusedAt - history.createdAt) + 'ms')

  const olderThanOneDay = Date.now() - history.createdAt > 24 * 60 * 60 * 1000
  const dayFormat = '%F %I:%M:%S %p'
  const hourFormat = '%I:%M:%S %p'
  const format = olderThanOneDay ? dayFormat : hourFormat
  const caption = strftime(format, new Date(history.createdAt))

  return (
    <ListItem className={className} key={history.id} onClick={onClick}>
      <ListItemText primary={caption} secondary={status} />
      <ListItemSecondaryAction>
        <ReplayTask history={history} />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

AdHocRunHistory.propTypes = {
  className: PropTypes.string,
  history: PropTypes.object.isRequired,
  onClick: PropTypes.func,
}

export default AdHocRunHistory
