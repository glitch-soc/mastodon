import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import StatusListContainer from '../ui/containers/status_list_container';
import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import {
  updateTimeline,
  deleteFromTimelines,
  connectTimeline,
  disconnectTimeline,
} from '../../actions/timelines';
import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import createStream from '../../stream';

const mapStateToProps = (state, ownprops) => ({
  streamingAPIBaseURL: state.getIn(['meta', 'streaming_api_base_url']),
  accessToken: state.getIn(['meta', 'access_token']),
  hasUnread: state.getIn(['timelines', ownprops.timelineId, 'unread']) > 0,
});

@connect(mapStateToProps)
export default class Timeline extends React.PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    streamingAPIBaseURL: PropTypes.string.isRequired,
    accessToken: PropTypes.string.isRequired,
    expand: PropTypes.func.isRequired,
    refresh: PropTypes.func,
    streamId: PropTypes.string,
    hasUnread: PropTypes.bool,
    columnName: PropTypes.string.isRequired,
    columnProps: PropTypes.object,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    emptyMessage: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    settings: PropTypes.element,
    scrollName: PropTypes.string.isRequired,
    timelineId: PropTypes.string.isRequired,
  };

  handlePin = () => {
    const { columnName, columnProps, columnId, dispatch } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn(columnName, columnProps || {}));
    }
  }

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  setRef = c => {
    this.column = c;
  }

  handleLoadMore = () => {
    this.props.dispatch(this.props.expand());
  }

  _subscribe (dispatch, streamId, timelineId) {
    const { streamingAPIBaseURL, accessToken } = this.props;

    if (!streamId || !timelineId) return;

    this.subscription = createStream(streamingAPIBaseURL, accessToken, streamId, {

      connected () {
        dispatch(connectTimeline(timelineId));
      },

      reconnected () {
        dispatch(connectTimeline(timelineId));
      },

      disconnected () {
        dispatch(disconnectTimeline(timelineId));
      },

      received (data) {
        switch(data.event) {
        case 'update':
          dispatch(updateTimeline(timelineId, JSON.parse(data.payload)));
          break;
        case 'delete':
          dispatch(deleteFromTimelines(data.payload));
          break;
        }
      },

    });
  }

  _unsubscribe () {
    if (typeof this.subscription !== 'undefined') {
      this.subscription.close();
      this.subscription = null;
    }
  }

  componentDidMount () {
    const { dispatch, refresh, streamId, timelineId } = this.props;

    if (typeof refresh !== 'function') return;

    dispatch(refresh());
    this._subscribe(dispatch, streamId, timelineId);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.streamId !== this.props.streamId || nextProps.timelineId !== this.props.timelineId) {

      if (typeof refresh !== 'function') return;

      this.props.dispatch(this.props.refresh());
      this._unsubscribe();
      this._subscribe(this.props.dispatch, nextProps.streamId, nextProps.timelineId);
    }
  }

  componentWillUnmount () {
    this._unsubscribe();
  }

  render () {
    const {
      hasUnread,
      columnId,
      multiColumn,
      emptyMessage,
      icon,
      title,
      settings,
      scrollName,
      timelineId,
    } = this.props;
    const pinned = !!columnId;

    return (
      <Column ref={this.setRef}>
        <ColumnHeader
          icon={icon}
          active={hasUnread}
          title={title}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          {settings}
        </ColumnHeader>

        <StatusListContainer
          trackScroll={!pinned}
          scrollKey={`${scrollName}-${columnId}`}
          loadMore={this.handleLoadMore}
          timelineId={timelineId}
          emptyMessage={emptyMessage}
        />
      </Column>
    );
  }

}
