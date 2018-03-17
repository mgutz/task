import React, {Component} from 'react'
import {connect} from 'react-redux'
import AddIcon from 'material-ui-icons/Add'
import Button from 'material-ui/Button'
import SaveHistoryFormDialog from './SaveHistoryFormDialog'
import PropTypes from 'prop-types'

const mapState = (state) => ({})

const mapDispatch = ({project: {saveHistory}}) => ({saveHistory})

@connect(mapState, mapDispatch)
class SaveHistory extends Component {
  state = {
    showForm: false,
  }

  renderForm() {
    const {showForm} = this.state
    if (!showForm) return null

    return (
      <SaveHistoryFormDialog
        open={showForm}
        onClose={this.doCloseForm}
        onSubmit={this.doSubmit}
      />
    )
  }

  render() {
    return (
      <div>
        <Button variant="fab" color="secondary" onClick={this.doShowForm} mini>
          <AddIcon />
        </Button>
        {this.renderForm()}
      </div>
    )
  }

  doCloseForm = () => {
    this.setState({showForm: false})
  }

  doShowForm = () => {
    this.setState({showForm: true})
  }

  doSubmit = (values) => {
    const {history, saveHistory} = this.props
    this.setState({showForm: false})
    saveHistory({title: values.title, history})
  }
}

SaveHistory.propTypes = {
  history: PropTypes.object.isRequired,
  saveHistory: PropTypes.func,
}

export default SaveHistory
