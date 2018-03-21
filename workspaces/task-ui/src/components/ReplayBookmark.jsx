import {connect} from 'react-redux'
import {PlayCircleFilled as PlayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import {bookmarkSlug} from '#/util'

const mapDispatch = ({histories: {replay}, router: {navigate}}) => ({
  navigate,
  replay,
})

@connect(null, mapDispatch)
class ReplayBookmark extends React.Component {
  static propTypes = {
    bookmark: PropTypes.object.isRequired,
    navigate: PropTypes.func,
    replay: PropTypes.func,
  }

  render() {
    const {bookmark} = this.props

    return (
      <IconButton onClick={this.doReplay(bookmark)}>
        <PlayIcon />
      </IconButton>
    )
  }

  doReplay = (bookmark) => () => {
    const {replay} = this.props
    // id for tracking the new history item
    const {record, id, title} = bookmark

    const ref = {
      id,
      kind: 'bookmark',
      title,
      route: {
        name: 'bookmarks.title.history',
        params: {
          id,
          title: bookmarkSlug(bookmark),
          historyId: null, // filled in by recordPlugin
        },
      },
    }

    replay({
      ref,
      record,
    })
  }
}

export default ReplayBookmark
