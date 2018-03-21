import React from 'react'
import Button from 'material-ui/Button'
import {TextField} from './formik'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog'
import PropTypes from 'prop-types'

import {Field, Formik} from 'formik'

const mapForm = (_props) => {
  return {
    title: '',
  }
}

class FormDialog extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool,
  }

  render() {
    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.doClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Save Task</DialogTitle>
          <DialogContent>
            <Formik
              initialValues={mapForm(this.props)}
              ref={this.setFormik}
              onSubmit={this.doSubmit}
            >
              {(formik) => {
                return (
                  <form onSubmit={formik.handleSubmit}>
                    <Field component={TextField} name="title" label="Title" />
                  </form>
                )
              }}
            </Formik>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.doClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.doSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  doClose = () => {
    this.props.onClose()
  }

  doSave = () => {
    this.formik.submitForm()
  }

  doSubmit = (values) => {
    this.props.onSubmit(values)
  }

  setFormik = (instance) => {
    this.formik = instance
  }
}

export default FormDialog
