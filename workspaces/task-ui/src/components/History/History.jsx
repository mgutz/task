import * as React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'
import classNames from 'classnames'
import Record from './Record'

const mapState = (state) => ({route: state.router.route})
const mapDispatch = ({router: {navigate}}) => ({navigate})

@connect(mapState, mapDispatch)
class History extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    navigate: PropTypes.func,
    route: PropTypes.object,
    title: PropTypes.string,
  }

  renderItems = (records, activeHistoryId) => {
    return records
      .slice(0)
      .reverse()
      .map((record) => {
        const isActive = activeHistoryId === record.id
        const classes = classNames({
          'is-selected': isActive,
        })

        const onClick = isActive ? null : this.doSetActive(record)

        return (
          <Record
            key={record.id}
            record={record}
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

  doSetActive = (record) => () => {
    const {navigate} = this.props
    navigate(record.route)
  }
}

export default History
