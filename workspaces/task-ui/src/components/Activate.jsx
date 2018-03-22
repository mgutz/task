import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'


const mapState = (state) => ({router: state.router.router})

class Activate {
  static propTypes = {
    class: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    params: PropTypes.object,
  }

  render() {
    const {router}
    const isActive =

  }
}
