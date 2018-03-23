import React, {Component} from 'react'
import {connect} from 'react-redux'
import AddCircleIcon from 'material-ui-icons/AddCircle'
import IconButton from 'material-ui/IconButton'
import SaveBookmarkFormDialog from './SaveBookmarkFormDialog'
import PropTypes from 'prop-types'

const mapState = () => ({})

const mapDispatch = ({project: {saveBookmark}}) => ({saveBookmark})

@connect(mapState, mapDispatch)
class SaveBookmark extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    saveBookmark: PropTypes.func,
  }

  state = {
    showForm: false,
  }

  renderForm() {
    const {showForm} = this.state
    if (!showForm) return null

    return (
      <SaveBookmarkFormDialog
        open={showForm}
        onClose={this.doCloseForm}
        onSubmit={this.doSubmit}
      />
    )
  }

  render() {
    const {ref} = this.props.record
    if (ref && ref.kind === 'bookmark') return null
    return (
      <div>
        <IconButton color="secondary" onClick={this.doShowForm}>
          <AddCircleIcon />
        </IconButton>
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
    const {record, saveBookmark} = this.props
    this.setState({showForm: false})
    saveBookmark({title: values.title, record: record})
  }
}

export default SaveBookmark
