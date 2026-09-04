import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, FormattedMessage } from 'react-intl';

import { Helmet } from '@unhead/react/helmet';

import { connect } from 'react-redux';

import PublicIcon from '@/material-icons/400-24px/public.svg?react';
import { Column } from '@/flavours/glitch/components/column';
import { ColumnHeader as LegacyColumnHeader } from '@/flavours/glitch/components/column/header';
import { DismissableBanner } from 'flavours/glitch/components/dismissable_banner';
import { injectIntl } from '@/flavours/glitch/components/intl';
import { identityContextPropShape, withIdentity } from 'flavours/glitch/identity_context';
import { domain, localLiveFeedAccess, remoteLiveFeedAccess } from 'flavours/glitch/initial_state';
import { canViewFeed } from 'flavours/glitch/permissions';

import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import { connectPublicStream } from '../../actions/streaming';
import { expandPublicTimeline } from '../../actions/timelines';
import StatusListContainer from '../ui/containers/status_list_container';

import ColumnSettingsContainer from './containers/column_settings_container';
import { isRedesignEnabled } from '@/flavours/glitch/utils/environment';
import { ColumnHeader, ColumnSettingsMenu } from '@/flavours/glitch/components/column_header';
import { FeedColumnSettings } from './components/feed_column_settings';
import { MultiColumnMenuItems } from '@/flavours/glitch/components/column_header/multicolumn_settings';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Federated timeline' },
  title_redesign: { id: 'column.other_servers', defaultMessage: 'Other Servers' },
});

const mapStateToProps = (state, { columnId }) => {
  const uuid = columnId;
  const columns = state.getIn(['settings', 'columns']);
  const index = columns.findIndex(c => c.get('uuid') === uuid);
  const onlyMedia = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyMedia']) : state.getIn(['settings', 'public', 'other', 'onlyMedia']);
  const onlyRemote = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyRemote']) : state.getIn(['settings', 'public', 'other', 'onlyRemote']);
  const allowLocalOnly = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'allowLocalOnly']) : state.getIn(['settings', 'public', 'other', 'allowLocalOnly']);
  const regex = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'regex', 'body']) : state.getIn(['settings', 'public', 'regex', 'body']);
  const timelineState = state.getIn(['timelines', `public${onlyRemote ? ':remote' : allowLocalOnly ? ':allow_local_only' : ''}${onlyMedia ? ':media' : ''}`]);

  return {
    hasUnread: !!timelineState && timelineState.get('unread') > 0,
    onlyMedia,
    onlyRemote,
    allowLocalOnly,
    regex,
  };
};

class PublicTimeline extends PureComponent {
  static defaultProps = {
    onlyMedia: false,
  };

  static propTypes = {
    identity: identityContextPropShape,
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    hasUnread: PropTypes.bool,
    onlyMedia: PropTypes.bool,
    onlyRemote: PropTypes.bool,
    allowLocalOnly: PropTypes.bool,
    regex: PropTypes.string,
  };

  handlePin = () => {
    const { columnId, dispatch, onlyMedia, onlyRemote, allowLocalOnly } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn(onlyRemote ? 'REMOTE' : 'PUBLIC', { other: { onlyMedia, onlyRemote, allowLocalOnly } }));
    }
  };

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  };

  componentDidMount () {
    const { dispatch, onlyMedia, onlyRemote, allowLocalOnly } = this.props;
    const { signedIn } = this.props.identity;

    dispatch(expandPublicTimeline({ onlyMedia, onlyRemote, allowLocalOnly }));
    if (signedIn) {
      this.disconnect = dispatch(connectPublicStream({ onlyMedia, onlyRemote, allowLocalOnly }));
    }
  }

  componentDidUpdate (prevProps) {
    const { signedIn } = this.props.identity;

    if (prevProps.onlyMedia !== this.props.onlyMedia || prevProps.onlyRemote !== this.props.onlyRemote || prevProps.allowLocalOnly !== this.props.allowLocalOnly) {
      const { dispatch, onlyMedia, onlyRemote, allowLocalOnly } = this.props;

      if (this.disconnect) {
        this.disconnect();
      }

      dispatch(expandPublicTimeline({ onlyMedia, onlyRemote, allowLocalOnly }));

      if (signedIn) {
        this.disconnect = dispatch(connectPublicStream({ onlyMedia, onlyRemote, allowLocalOnly }));
      }
    }
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  handleLoadMore = maxId => {
    const { dispatch, onlyMedia, onlyRemote, allowLocalOnly } = this.props;

    dispatch(expandPublicTimeline({ maxId, onlyMedia, onlyRemote, allowLocalOnly }));
  };

  render () {
    const { intl, columnId, hasUnread, multiColumn, onlyMedia, onlyRemote, allowLocalOnly } = this.props;
    const { signedIn, permissions } = this.props.identity;
    const pinned = !!columnId;

    const emptyMessage = (canViewFeed(signedIn, permissions, localLiveFeedAccess) || canViewFeed(signedIn, permissions, remoteLiveFeedAccess)) ? (
      <FormattedMessage
        id='empty_column.public'
        defaultMessage='There is nothing here! Write something publicly, or manually follow users from other servers to fill it up'
      />
    ) : (
      <FormattedMessage
        id='empty_column.disabled_feed'
        defaultMessage='This feed has been disabled by your server administrators.'
      />
    );

    const title = intl.formatMessage(isRedesignEnabled() ? messages.title_redesign : messages.title)

    return (
      <Column bindToDocument={!multiColumn} label={title}>
        {isRedesignEnabled() ? (
          <ColumnHeader
            title={title}
            withUnreadMarker={hasUnread}
            extraButtons={
              <ColumnSettingsMenu
                labelPrefix={title}
              >
                <FeedColumnSettings columnId={columnId} />
                {multiColumn && (
                  <MultiColumnMenuItems
                    withDivider
                    pinned={pinned}
                    onPin={this.handlePin}
                    onMove={this.handleMove}
                  />
                )}
              </ColumnSettingsMenu>
            }
          />
        ) : (
          <LegacyColumnHeader
            icon='globe'
            iconComponent={PublicIcon}
            active={hasUnread}
            title={title}
            onPin={this.handlePin}
            onMove={this.handleMove}
            pinned={pinned}
            multiColumn={multiColumn}
            scrollTopOnClick
          >
            <ColumnSettingsContainer columnId={columnId} />
          </LegacyColumnHeader>
        )}

        <StatusListContainer
          prepend={<DismissableBanner id='public_timeline'><FormattedMessage id='dismissable_banner.public_timeline' defaultMessage='These are the most recent public posts from people on the fediverse that people on {domain} follow.' values={{ domain }} /></DismissableBanner>}
          timelineId={`public${onlyRemote ? ':remote' : (allowLocalOnly ? ':allow_local_only' : '')}${onlyMedia ? ':media' : ''}`}
          onLoadMore={this.handleLoadMore}
          trackScroll={!pinned}
          scrollKey={`public_timeline-${columnId}`}
          emptyMessage={emptyMessage}
          bindToDocument={!multiColumn}
          regex={this.props.regex}
        />

        <Helmet>
          <title>{title}</title>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(withIdentity(injectIntl(PublicTimeline)));
