import * as _ from 'lodash'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import styled from 'styled-components'
import SaveHistory from './SaveHistory'

const ToolbarView = styled(Toolbar)`
  border-bottom: solid 1px #eee;
  margin-bottom: 10px;
`
const Grow = styled.div`
  flex: 1;
`

const SimpleArgs = ({data}) => {
  if (!data) return null

  const simple = ['string', 'number']
  const elements = []
  for (const k in data) {
    const typ = typeof k
    if (simple.indexOf(typ) > -1) {
      elements.push(
        <span key={elements.length}>
          <b>{k}</b>: {data[k]}
        </span>
      )
    } else {
      elements.push(
        <span key={elements.length}>
          <b>{k}</b>: ...
        </span>
      )
    }
  }
  return elements
}

class HistoryActions extends Component {
  static propTypes = {
    history: PropTypes.object,
  }

  render() {
    if (!this.props.history) return null

    const {history} = this.props

    const title = `${_.upperFirst(history.args[1])}`

    return (
      <ToolbarView>
        <Grow>
          <Typography variant="title">{title}</Typography>
          <Typography variant="subheading">
            <SimpleArgs data={history.args[2]} />
          </Typography>
        </Grow>
        <SaveHistory history={history} />
      </ToolbarView>
    )
  }
}

export default HistoryActions
