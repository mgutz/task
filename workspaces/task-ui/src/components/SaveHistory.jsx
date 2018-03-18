import React, {Component} from 'react'
import {connect} from 'react-redux'
import AddIcon from 'material-ui-icons/Add'
import Button from 'material-ui/Button'
import SaveHistoryFormDialog from './SaveHistoryFormDialog'
import PropTypes from 'prop-types'

const mapState = () => ({})

const mapDispatch = ({project: {saveBookmark}}) => ({saveBookmark})

@connect(mapState, mapDispatch)
class SaveHistory extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    saveBookmark: PropTypes.func,
  }

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
    const {history, saveBookmark} = this.props
    this.setState({showForm: false})
    saveBookmark({title: values.title, history})
  }
}

export default SaveHistory
