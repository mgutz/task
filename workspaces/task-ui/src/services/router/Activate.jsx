import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {router} from './router'
import {konsole} from '#/util'

// <Activate class="is-selected" route={{name, params}}><Child /></Activate>
@connect((state) => ({currentRoute: state.router.route}))
export class Activate extends PureComponent {
  static propTypes = {
    class: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    currentRoute: PropTypes.object.isRequired,
    onActivate: PropTypes.func,
    pathProp: PropTypes.string,
    route: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const {onActivate, route} = this.props
    if (!onActivate) return
    const isActive = router.isActive(route.name, route.params)
    if (isActive) {
      onActivate(this.props.currentRoute)
    }
  }

  render() {
    if (!this.props.route) return this.props.children

    const {route} = this.props
    const {class: activeClass, children} = this.props
    const isActive = router.isActive(route.name, route.params)

    const klass = isActive ? activeClass : ''
    const handler = isActive ? null : this.doActivate
    const child = React.Children.only(children)

    return React.cloneElement(child, {
      className: klass,
      onClick: handler,
    })
  }

  doActivate = () => {
    const {route} = this.props

    router.navigate(route.name, route.params, (err, state) => {
      if (err) {
        if (err.code !== 'SAME_STATES') {
          konsole.error('Navigation Error', err)
        } else {
          konsole.error(err)
        }
        return
      }

      if (this.props.onActivate) this.props.onActivate(state)
    })
  }
}
