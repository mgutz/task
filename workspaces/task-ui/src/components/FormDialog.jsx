import React from 'react'
import Button from 'material-ui/Button'
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog'
import PropTypes from 'prop-types'

class FormDialog extends React.Component {
  static propTypes = {
    buttonCaption: PropTypes.string,
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
  }

  // React will complain that Formik onSubmit is marked as required but we're
  // setting it on below. Cannot surpress it.
  render() {
    const {buttonCaption, children, title} = this.props
    return (
      <div>
        <Dialog
          open={this.props.open}
          onClose={this.doClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{title}</DialogTitle>
          <DialogContent>
            {React.cloneElement(React.Children.only(children), {
              ref: this.setFormik,
              onSubmit: this.doSubmit,
            })}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.doClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.doSave} color="primary">
              {buttonCaption}
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
