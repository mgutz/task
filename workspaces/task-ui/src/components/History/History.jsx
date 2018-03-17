import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'
import {select} from '@rematch/select'
import classNames from 'classnames'
import {withRoute} from 'react-router5'
import AdHocRunHistory from './AdHocRunHistory'

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

@withRoute
@connect(mapState)
export default class History extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    router: PropTypes.object.isRequired,
    task: PropTypes.object,
  }

  renderItems = (histories, task, activeHistoryId) => {
    return histories.map((history) => {
      const classes = classNames({
        'is-selected': activeHistoryId === history.id,
      })

      if (history.kind === 'run') {
        return (
          <AdHocRunHistory
            key={history.id}
            history={history}
            className={classes}
            onClick={this.doSetActive(history)}
          />
        )
      }

      throw new Error(
        `History of kind '${history.kind}' is not currently handled`
      )
    })
  }

  render() {
    const {histories, router, task} = this.props
    const caption = histories && histories.length > 0 ? 'History' : 'No History'

    return (
      <List>
        <ListSubheader>{caption}</ListSubheader>
        {histories &&
          this.renderItems(histories, task, router.getState().params.historyId)}
      </List>
    )
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
