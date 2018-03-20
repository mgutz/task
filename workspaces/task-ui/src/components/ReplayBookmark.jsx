import {connect} from 'react-redux'
import {PlayCircleFilled as PlayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import {uid, bookmarkSlug} from '#/util'

const mapDispatch = ({
  taskfiles: {run},
  project: {setBookmarkActiveHistory},
  router: {navigate},
}) => ({
  navigate,
  run,
  setBookmarkActiveHistory,
})

@connect(null, mapDispatch)
class ReplayBookmark extends React.Component {
  static propTypes = {
    bookmark: PropTypes.object.isRequired,
    navigate: PropTypes.func,
    run: PropTypes.func,
    setBookmarkActiveHistory: PropTypes.func,
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
    const {navigate, run, setBookmarkActiveHistory} = this.props
    // id for tracking the new history item
    const newHistoryId = uid()
    const {args, id, title} = bookmark
    const route = {
      name: 'bookmarks.title.history',
      params: {
        id,
        title: bookmarkSlug(bookmark),
        historyId: newHistoryId,
      },
    }
    run({
      newHistoryId,
      args,
      refId: bookmark.id,
      refKind: 'bookmark',
      route,
      title,
    })

    // set new history as active
    setBookmarkActiveHistory({id, historyId: newHistoryId})

    // navigate to new history to highlight it
    navigate(route)
  }
}

export default ReplayBookmark
