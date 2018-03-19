import * as _ from 'lodash'
import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'
import classNames from 'classnames'
import HistoryItem from './HistoryItem'

const mapState = (state) => ({route: state.router.route})
const mapDispatch = ({router: {navigate}}) => ({navigate})

@connect(mapState, mapDispatch)
class History extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    bookmark: PropTypes.object,
    navigate: PropTypes.func,
    route: PropTypes.object,
    title: PropTypes.string,
  }

  renderItems = (histories, activeHistoryId) => {
    return histories
      .slice(0)
      .reverse()
      .map((history) => {
        const isActive = activeHistoryId === history.id
        const classes = classNames({
          'is-selected': isActive,
        })

        const onClick = isActive ? null : this.doSetActive(history)

        return (
          <HistoryItem
            key={history.id}
            history={history}
            className={classes}
            onClick={onClick}
          />
        )
      })
  }

  render() {
    const {histories, route, title} = this.props
    return (
      <List>
        <ListSubheader>{title}</ListSubheader>
        {histories && this.renderItems(histories, route.params.historyId)}
      </List>
    )
  }

  doSetActive = (history) => () => {
    const {navigate} = this.props
    navigate(history.route)
  }
}

export default History
