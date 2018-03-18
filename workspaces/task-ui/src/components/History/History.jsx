import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'
import {select} from '@rematch/select'
import classNames from 'classnames'
import AdHocRunHistory from './AdHocRunHistory'

const mapState = (state, props) => {
  const {route} = state.router

  if (props.task) {
    const {name, taskfileId} = props.task
    return {
      histories: select.histories.byQuery(state, {
        taskfileId,
        taskName: name,
      }),
      route: state.router.route,
    }
  }

  return {route}
}

const mapDispatch = ({router: {navigate}}) => ({navigate})

@connect(mapState, mapDispatch)
export default class History extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    navigate: PropTypes.func.isRequired,
    route: PropTypes.object.isRequired,
    task: PropTypes.object,
  }

  renderItems = (histories, task, activeHistoryId) => {
    return histories.map((history) => {
      const isActive = activeHistoryId === history.id
      const classes = classNames({
        'is-selected': isActive,
      })

      const onClick = isActive ? null : this.doSetActive(history)

      if (history.kind === 'run') {
        return (
          <AdHocRunHistory
            key={history.id}
            history={history}
            className={classes}
            onClick={onClick}
          />
        )
      }

      throw new Error(
        `History of kind '${history.kind}' is not currently handled`
      )
    })
  }

  render() {
    const {histories, route, task} = this.props
    const caption = histories && histories.length > 0 ? 'History' : 'No History'

    return (
      <List>
        <ListSubheader>{caption}</ListSubheader>
        {histories && this.renderItems(histories, task, route.params.historyId)}
      </List>
    )
  }

  doSetActive = (history) => () => {
    const {navigate} = this.props
    const {taskfileId, taskName, id} = history
    navigate({
      name: 'tasks.name.history',
      params: {
        taskName,
        taskfileId,
        historyId: id,
      },
    })
  }
}
