import React from 'react'
import IconButton from 'material-ui/IconButton'
import {FiberManualRecord as Record} from 'material-ui-icons'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const RecordIcon = styled(Record)`
  color: ${(props) => (props.status === 'running' ? 'green' : '')};
`

const HistoryStatus = ({history: {status}}) => {
  if (status !== 'running') return null
  return (
    <IconButton>
      <RecordIcon status={status} />
    </IconButton>
  )
}

HistoryStatus.propTypes = {
  history: PropTypes.object,
}

export default HistoryStatus
