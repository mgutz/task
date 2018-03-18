import * as _ from 'lodash'
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
  let refId = _.get(props, 'task.id') || _.get(props, 'bookmark.id')
  return {
    histories: select.histories.byQuery(state, {refId}),
    route,
  }
}

const mapDispatch = ({router: {navigate}}) => ({navigate})

@connect(mapState, mapDispatch)
class History extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    bookmark: PropTypes.object,
    navigate: PropTypes.func,
    route: PropTypes.object,
    task: PropTypes.object,
  }

  renderItems = (histories, task, activeHistoryId) => {
    return histories.map((history) => {
      const isActive = activeHistoryId === history.id
      const classes = classNames({
        'is-selected': isActive,
      })

      const onClick = isActive ? null : this.doSetActive(history)

      return (
        <AdHocRunHistory
          key={history.id}
          history={history}
          className={classes}
          onClick={onClick}
        />
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
    const {navigate, route} = this.props
    const {taskfileId, taskName, id} = history
    navigate({
      name: 'tasks.name.history',
      params: {
        historyId: id,
        id: route.params.id,
        taskName,
        taskfileId,
      },
    })
  }
}

export default History
