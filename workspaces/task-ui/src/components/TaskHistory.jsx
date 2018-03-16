import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListSubHeader,
} from '#/components/material'
import {FiberManualRecord, Replay as ReplayIcon} from 'material-ui-icons'
import * as strftime from 'strftime'
import {select} from '@rematch/select'
import IconButton from 'material-ui/IconButton'
import classNames from 'classnames'
import {withRoute} from 'react-router5'
import styled from 'styled-components'

const Status = styled(FiberManualRecord)`
  color: ${(props) => (props.status === 'running' ? 'green' : '')};
`

const mapState = (state, props) => {
  if (!props.task) return {}

  const {name, taskfileId} = props.task
  return {
    histories: select.histories.byQuery(state, {
      taskfileId,
      taskName: name,
    }),
  }
}

const mapDispatch = ({taskfiles: {replay}}) => ({
  replay,
})

@withRoute
@connect(mapState, mapDispatch)
export default class TaskHistory extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    replay: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    task: PropTypes.object,
  }

  renderItems = (histories, task, activeHistoryId) => {
    return histories.map((history) => {
      const status =
        `pid: ${history.pid} ` +
        (history.status === 'running'
          ? ''
          : 'for: ' + (history.statusedAt - history.createdAt) + 'ms')

      const olderThanOneDay =
        Date.now() - history.createdAt > 24 * 60 * 60 * 1000
      const dayFormat = '%F %I:%M:%S %p'
      const hourFormat = '%I:%M:%S %p'
      const format = olderThanOneDay ? dayFormat : hourFormat
      const caption = strftime(format, new Date(history.createdAt))
      const classes = classNames({
        'is-selected': activeHistoryId === history.id,
      })

      return (
        <ListItem
          className={classes}
          key={history.id}
          onClick={this.doSetActive(history)}
          divider
        >
          <ListItemText primary={caption} secondary={status} />
          <ListItemSecondaryAction>
            {history.status === 'closed' ? (
              <IconButton onClick={this.doReplay(history)}>
                <ReplayIcon />
              </IconButton>
            ) : (
              <Status value="fiber_manual_record" status={history.status} />
            )}
          </ListItemSecondaryAction>
        </ListItem>
      )
    })
  }

  render() {
    const {histories, router, task} = this.props
    const caption = histories && histories.length > 0 ? 'History' : 'No History'

    return (
      <List>
        <ListSubHeader>{caption}</ListSubHeader>
        {histories &&
          this.renderItems(histories, task, router.getState().params.historyId)}
      </List>
    )
  }

  doReplay = (history) => () => {
    this.props.replay(history)
  }

  doSetActive = (history) => () => {
    const {router} = this.props
    const {taskfileId, taskName, id} = history

    router.navigate('tasks.name.history', {
      taskName,
      taskfileId,
      historyId: id,
    })
  }
}
