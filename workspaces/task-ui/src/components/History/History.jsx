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
          setLocation={this.doNavigate(history)}
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

  // called by replay tasks to set the location for new history
  doNavigate = ({args}) => (newHistoryId) => {
    const {bookmark, navigate, task} = this.props

    if (task) {
      // navigate to new history to highlight it
      const params = {
        id: task.id,
        taskfileId: args[0],
        taskName: args[1],
        newHistoryId,
      }
      navigate({name: 'tasks.name.history', params})
    } else if (bookmark) {
      // navigate to new history to highlight it
      const params = {
        id: bookmark.id,
        title: bookmark.title,
        newHistoryId,
      }
      navigate({name: 'bookmarks.title.history', params})
    }
  }
}

History.propTypes = {
  histories: PropTypes.array,
  bookmark: PropTypes.object,
  navigate: PropTypes.func,
  route: PropTypes.object,
  task: PropTypes.object,
}

export default History
