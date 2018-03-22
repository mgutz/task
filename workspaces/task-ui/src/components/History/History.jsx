import * as React from 'react'
import PropTypes from 'prop-types'
import ListSubheader from 'material-ui/List/ListSubheader'
import List from 'material-ui/List'
import Record from './Record'
import Activate from '../Activate'

class History extends React.Component {
  static propTypes = {
    histories: PropTypes.array,
    title: PropTypes.string,
  }

  renderItems = (records) => {
    return records
      .slice(0)
      .reverse()
      .map((record) => {
        return (
          <Activate
            class="is-selected"
            route={record.ref.route}
            key={record.id}
          >
            <Record key={record.id} record={record} />
          </Activate>
        )
      })
  }

  render() {
    const {histories, title} = this.props
    return (
      <List>
        <ListSubheader>{title}</ListSubheader>
        {histories && this.renderItems(histories)}
      </List>
    )
  }
}

export default History
