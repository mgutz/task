import PropTypes from 'prop-types'
import React, {Component} from 'react'
import Bookmarks from '../Bookmarks'

class BookmarksPanel extends Component {
  static propTypes = {
    project: PropTypes.object,
  }

  render() {
    const {project} = this.props
    return <Bookmarks bookmarks={project.bookmarks} />
  }
}

export default BookmarksPanel
