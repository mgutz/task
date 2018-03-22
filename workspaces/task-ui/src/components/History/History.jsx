import * as React from 'react'
import PropTypes from 'prop-types'
import List from 'material-ui/List'
import Record from './Record'
import {Activate} from '#/services/router'

class History extends React.Component {
  static propTypes = {
    records: PropTypes.array,
    title: PropTypes.string,
  }

  renderItems = (records) => {
    return records.map((record) => {
      return (
        <Activate class="is-selected" route={record.ref.route} key={record.id}>
          <Record key={record.id} record={record} />
        </Activate>
      )
    })
  }

  render() {
    const {records} = this.props
    return <List>{records && this.renderItems(records)}</List>
  }
}

export default History
