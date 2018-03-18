import * as _ from 'lodash'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import styled from 'styled-components'
import SaveHistory from './SaveHistory'
import HistoryStatus from './HistoryStatus'

const ToolbarView = styled(Toolbar)`
  border-bottom: solid 1px #eee;
  margin-bottom: 10px;
`

const Flexography = styled(Typography)`
  flex: 1;
`

class HistoryActions extends Component {
  render() {
    if (!this.props.history) return null

    const {history} = this.props

    const title = `${_.upperFirst(history.args[1])}`
    const args = JSON.stringify(history.args[2])

    return (
      <ToolbarView>
        <HistoryStatus history={history} />
        <Typography variant="title">{title}</Typography>
        <Flexography>{args}</Flexography>
        <SaveHistory history={history} />
      </ToolbarView>
    )
  }
}

HistoryActions.propTypes = {
  history: PropTypes.object,
}

export default HistoryActions
