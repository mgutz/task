import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {router} from './router'

// <Activate class="is-selected" route={{name, params}}><Child /></Activate>
@connect((state) => ({currentRoute: state.router.route}))
export class Activate extends PureComponent {
  static propTypes = {
    class: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    pathProp: PropTypes.string,
    route: PropTypes.object.isRequired,
  }

  render() {
    if (!this.props.route) return this.props.children

    const {class: activeClass, children, route} = this.props

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
    router.navigate(route.name, route.params)
  }
}
