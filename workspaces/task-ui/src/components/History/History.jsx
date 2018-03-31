import * as React from 'react'
import PropTypes from 'prop-types'
import List from 'material-ui/List'
import Record from './Record'
import {Activate} from '#/services/router'
import {connect} from 'react-redux'

const mapDispatch = ({histories: {attach}}) => ({attach})

@connect(null, mapDispatch)
class History extends React.Component {
  static propTypes = {
    attach: PropTypes.func.isRequired,
    records: PropTypes.array,
    title: PropTypes.string,
  }

  renderItems = (records) => {
    return records.map((record) => {
      return (
        <Activate
          class="is-selected History"
          route={record.ref.route}
          key={record.id}
          onActivate={this.doActivate(record)}
        >
          <Record key={record.id} record={record} />
        </Activate>
      )
    })
  }

  render() {
    const {records} = this.props
    return <List>{records && this.renderItems(records)}</List>
  }

  doActivate = (record) => () => {
    if (record.attached) return

    // attach logs on-the-fly
    this.props.attach({historyId: record.id, logFile: record.logFile})
  }
}

export default History
