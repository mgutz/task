import {connect} from 'react-redux'
import {PlayCircleFilled as PlayIcon} from 'material-ui-icons'
import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import PropTypes from 'prop-types'
import {uid} from '#/util'

const mapDispatch = ({
  taskfiles: {run},
  project: {setActiveBookmarkHistory},
  router: {navigate},
}) => ({
  navigate,
  run,
  setActiveBookmarkHistory,
})

@connect(null, mapDispatch)
class ReplayBookmark extends React.Component {
  render() {
    const {bookmark} = this.props

    return (
      <IconButton onClick={this.doReplay(bookmark)}>
        <PlayIcon />
      </IconButton>
    )
  }

  doReplay = (bookmark) => () => {
    const {navigate, run, setActiveBookmarkHistory} = this.props
    // id for tracking the new history item
    const newHistoryId = uid()
    const {args, id, title} = bookmark
    run({newHistoryId, args, refId: bookmark.id, refKind: 'bookmark'})

    // set new history as active
    setActiveBookmarkHistory({id, historyId: newHistoryId})

    // navigate to new history to highlight it
    const params = {
      id,
      title,
      historyId: newHistoryId,
    }
    navigate({name: 'bookmarks.title.history', params})
  }
}

ReplayBookmark.propTypes = {
  bookmark: PropTypes.object.isRequired,
  navigate: PropTypes.func,
  run: PropTypes.func,
  setActiveBookmarkHistory: PropTypes.func,
}

export default ReplayBookmark
