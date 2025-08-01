import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import ChatIcon from '@/material-icons/400-24px/chat.svg?react';
import VisibilityIcon from '@/material-icons/400-24px/visibility.svg?react';
import VisibilityOffIcon from '@/material-icons/400-24px/visibility_off.svg?react';
import { Hotkeys }  from 'flavours/glitch/components/hotkeys';
import { Icon }  from 'flavours/glitch/components/icon';
import { LoadingIndicator } from 'flavours/glitch/components/loading_indicator';
import { TimelineHint } from 'flavours/glitch/components/timeline_hint';
import ScrollContainer from 'flavours/glitch/containers/scroll_container';
import BundleColumnError from 'flavours/glitch/features/ui/components/bundle_column_error';
import { identityContextPropShape, withIdentity } from 'flavours/glitch/identity_context';
import { autoUnfoldCW } from 'flavours/glitch/utils/content_warning';
import { WithRouterPropTypes } from 'flavours/glitch/utils/react_router';

import { initBlockModal } from '../../actions/blocks';
import {
  replyCompose,
  mentionCompose,
  directCompose,
} from '../../actions/compose';
import {
  toggleFavourite,
  bookmark,
  unbookmark,
  toggleReblog,
  pin,
  unpin,
} from '../../actions/interactions';
import { openModal } from '../../actions/modal';
import { initMuteModal } from '../../actions/mutes';
import { initReport } from '../../actions/reports';
import {
  fetchStatus,
  muteStatus,
  unmuteStatus,
  deleteStatus,
  editStatus,
  hideStatus,
  revealStatus,
  translateStatus,
  undoStatusTranslation,
} from '../../actions/statuses';
import ColumnHeader from '../../components/column_header';
import { textForScreenReader, defaultMediaVisibility } from '../../components/status';
import { StatusQuoteManager } from '../../components/status_quoted';
import { deleteModal } from '../../initial_state';
import { makeGetStatus, makeGetPictureInPicture } from '../../selectors';
import { getAncestorsIds, getDescendantsIds } from 'flavours/glitch/selectors/contexts';
import Column from '../ui/components/column';
import { attachFullscreenListener, detachFullscreenListener, isFullscreen } from '../ui/util/fullscreen';

import ActionBar from './components/action_bar';
import { DetailedStatus } from './components/detailed_status';
import { RefreshController } from './components/refresh_controller';

const messages = defineMessages({
  revealAll: { id: 'status.show_more_all', defaultMessage: 'Show more for all' },
  hideAll: { id: 'status.show_less_all', defaultMessage: 'Show less for all' },
  statusTitleWithAttachments: { id: 'status.title.with_attachments', defaultMessage: '{user} posted {attachmentCount, plural, one {an attachment} other {# attachments}}' },
  detailedStatus: { id: 'status.detailed_status', defaultMessage: 'Detailed conversation view' },
  tootHeading: { id: 'account.posts_with_replies', defaultMessage: 'Posts and replies' },
});

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();
  const getPictureInPicture = makeGetPictureInPicture();

  const mapStateToProps = (state, props) => {
    const status = getStatus(state, { id: props.params.statusId, contextType: 'detailed' });

    let ancestorsIds   = [];
    let descendantsIds = [];

    if (status) {
      ancestorsIds   = getAncestorsIds(state, status.get('in_reply_to_id'));
      descendantsIds = getDescendantsIds(state, status.get('id'));
    }

    return {
      isLoading: state.getIn(['statuses', props.params.statusId, 'isLoading']),
      status,
      ancestorsIds,
      descendantsIds,
      settings: state.get('local_settings'),
      askReplyConfirmation: state.getIn(['local_settings', 'confirm_before_clearing_draft']) && state.getIn(['compose', 'text']).trim().length !== 0,
      domain: state.getIn(['meta', 'domain']),
      pictureInPicture: getPictureInPicture(state, { id: props.params.statusId }),
    };
  };

  return mapStateToProps;
};

const truncate = (str, num) => {
  const arr = Array.from(str);
  if (arr.length > num) {
    return arr.slice(0, num).join('') + '…';
  } else {
    return str;
  }
};

const titleFromStatus = (intl, status) => {
  const displayName = status.getIn(['account', 'display_name']);
  const username = status.getIn(['account', 'username']);
  const user = displayName.trim().length === 0 ? username : displayName;
  const text = status.get('search_index');
  const attachmentCount = status.get('media_attachments').size;

  return text ? `${user}: "${truncate(text, 30)}"` : intl.formatMessage(messages.statusTitleWithAttachments, { user, attachmentCount });
};

class Status extends ImmutablePureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    status: ImmutablePropTypes.map,
    isLoading: PropTypes.bool,
    settings: ImmutablePropTypes.map.isRequired,
    ancestorsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    descendantsIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    intl: PropTypes.object.isRequired,
    askReplyConfirmation: PropTypes.bool,
    multiColumn: PropTypes.bool,
    domain: PropTypes.string.isRequired,
    pictureInPicture: ImmutablePropTypes.contains({
      inUse: PropTypes.bool,
      available: PropTypes.bool,
    }),
    ...WithRouterPropTypes
  };

  state = {
    fullscreen: false,
    isExpanded: undefined,
    threadExpanded: undefined,
    statusId: undefined,
    loadedStatusId: undefined,
    showMedia: undefined,
    revealBehindCW: undefined,
  };

  componentDidMount () {
    attachFullscreenListener(this.onFullScreenChange);
    this.props.dispatch(fetchStatus(this.props.params.statusId));
    this._scrollStatusIntoView();
  }

  static getDerivedStateFromProps(props, state) {
    let update = {};
    let updated = false;

    if (props.params.statusId && state.statusId !== props.params.statusId) {
      props.dispatch(fetchStatus(props.params.statusId));
      update.threadExpanded = undefined;
      update.statusId = props.params.statusId;
      updated = true;
    }

    const revealBehindCW = props.settings.getIn(['media', 'reveal_behind_cw']);
    if (revealBehindCW !== state.revealBehindCW) {
      update.revealBehindCW = revealBehindCW;
      if (revealBehindCW) update.showMedia = defaultMediaVisibility(props.status, props.settings);
      updated = true;
    }

    if (props.status && state.loadedStatusId !== props.status.get('id')) {
      update.showMedia = defaultMediaVisibility(props.status, props.settings);
      update.loadedStatusId = props.status.get('id');
      update.isExpanded = autoUnfoldCW(props.settings, props.status);
      updated = true;
    }

    return updated ? update : null;
  }

  handleToggleHidden = () => {
    const { status } = this.props;

    if (this.props.settings.getIn(['content_warnings', 'shared_state'])) {
      if (status.get('hidden')) {
        this.props.dispatch(revealStatus(status.get('id')));
      } else {
        this.props.dispatch(hideStatus(status.get('id')));
      }
    } else if (this.props.status.get('spoiler_text')) {
      this.setExpansion(!this.state.isExpanded);
    }
  };

  handleToggleMediaVisibility = () => {
    this.setState({ showMedia: !this.state.showMedia });
  };


  handleFavouriteClick = (status, e) => {
    const { dispatch } = this.props;
    const { signedIn } = this.props.identity;

    if (signedIn) {
      dispatch(toggleFavourite(status.get('id'), e && e.shiftKey));
    } else {
      dispatch(openModal({
        modalType: 'INTERACTION',
        modalProps: {
          type: 'favourite',
          accountId: status.getIn(['account', 'id']),
          url: status.get('uri'),
        },
      }));
    }
  };

  handlePin = (status) => {
    if (status.get('pinned')) {
      this.props.dispatch(unpin(status));
    } else {
      this.props.dispatch(pin(status));
    }
  };

  handleReplyClick = (status) => {
    const { askReplyConfirmation, dispatch } = this.props;
    const { signedIn } = this.props.identity;

    if (signedIn) {
      if (askReplyConfirmation) {
        dispatch(openModal({ modalType: 'CONFIRM_REPLY', modalProps: { status } }));
      } else {
        dispatch(replyCompose(status));
      }
    } else {
      dispatch(openModal({
        modalType: 'INTERACTION',
        modalProps: {
          type: 'reply',
          accountId: status.getIn(['account', 'id']),
          url: status.get('uri'),
        },
      }));
    }
  };

  handleReblogClick = (status, e) => {
    const { dispatch } = this.props;
    const { signedIn } = this.props.identity;

    if (signedIn) {
      dispatch(toggleReblog(status.get('id'), e && e.shiftKey));
    } else {
      dispatch(openModal({
        modalType: 'INTERACTION',
        modalProps: {
          type: 'reblog',
          accountId: status.getIn(['account', 'id']),
          url: status.get('uri'),
        },
      }));
    }
  };

  handleBookmarkClick = (status) => {
    if (status.get('bookmarked')) {
      this.props.dispatch(unbookmark(status));
    } else {
      this.props.dispatch(bookmark(status));
    }
  };

  handleDeleteClick = (status, withRedraft = false) => {
    const { dispatch } = this.props;

    if (!deleteModal) {
      dispatch(deleteStatus(status.get('id'), withRedraft));
    } else {
      dispatch(openModal({ modalType: 'CONFIRM_DELETE_STATUS', modalProps: { statusId: status.get('id'), withRedraft } }));
    }
  };

  handleEditClick = (status) => {
    const { dispatch, askReplyConfirmation } = this.props;

    if (askReplyConfirmation) {
      dispatch(openModal({ modalType: 'CONFIRM_EDIT_STATUS', modalProps: { statusId: status.get('id') } }));
    } else {
      dispatch(editStatus(status.get('id')));
    }
  };

  handleDirectClick = (account) => {
    this.props.dispatch(directCompose(account));
  };

  handleMentionClick = (account) => {
    this.props.dispatch(mentionCompose(account));
  };

  handleOpenMedia = (media, index, lang) => {
    this.props.dispatch(openModal({
      modalType: 'MEDIA',
      modalProps: { statusId: this.props.status.get('id'), media, index, lang },
    }));
  };

  handleOpenVideo = (media, lang, options) => {
    this.props.dispatch(openModal({
      modalType: 'VIDEO',
      modalProps: { statusId: this.props.status.get('id'), media, lang, options },
    }));
  };

  handleHotkeyOpenMedia = e => {
    const { status } = this.props;

    e.preventDefault();

    if (status.get('media_attachments').size > 0) {
      if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        this.handleOpenVideo(status.getIn(['media_attachments', 0]), { startTime: 0 });
      } else {
        this.handleOpenMedia(status.get('media_attachments'), 0);
      }
    }
  };

  handleMuteClick = (account) => {
    this.props.dispatch(initMuteModal(account));
  };

  handleConversationMuteClick = (status) => {
    if (status.get('muted')) {
      this.props.dispatch(unmuteStatus(status.get('id')));
    } else {
      this.props.dispatch(muteStatus(status.get('id')));
    }
  };

  handleToggleAll = () => {
    const { status, ancestorsIds, descendantsIds, settings } = this.props;
    const statusIds = [status.get('id')].concat(ancestorsIds, descendantsIds);
    let { isExpanded } = this.state;

    if (settings.getIn(['content_warnings', 'shared_state']))
      isExpanded = !status.get('hidden');

    if (!isExpanded) {
      this.props.dispatch(revealStatus(statusIds));
    } else {
      this.props.dispatch(hideStatus(statusIds));
    }

    this.setState({ isExpanded: !isExpanded, threadExpanded: !isExpanded });
  };

  handleTranslate = status => {
    const { dispatch } = this.props;

    if (status.get('translation')) {
      dispatch(undoStatusTranslation(status.get('id'), status.get('poll')));
    } else {
      dispatch(translateStatus(status.get('id')));
    }
  };

  handleBlockClick = (status) => {
    const { dispatch } = this.props;
    const account = status.get('account');
    dispatch(initBlockModal(account));
  };

  handleReport = (status) => {
    this.props.dispatch(initReport(status.get('account'), status));
  };

  handleEmbed = (status) => {
    this.props.dispatch(openModal({
      modalType: 'EMBED',
      modalProps: { id: status.get('id') },
    }));
  };

  handleHotkeyToggleSensitive = () => {
    this.handleToggleMediaVisibility();
  };

  handleHotkeyMoveUp = () => {
    this.handleMoveUp(this.props.status.get('id'));
  };

  handleHotkeyMoveDown = () => {
    this.handleMoveDown(this.props.status.get('id'));
  };

  handleHotkeyReply = e => {
    e.preventDefault();
    this.handleReplyClick(this.props.status);
  };

  handleHotkeyFavourite = () => {
    this.handleFavouriteClick(this.props.status);
  };

  handleHotkeyBoost = () => {
    this.handleReblogClick(this.props.status);
  };

  handleHotkeyBookmark = () => {
    this.handleBookmarkClick(this.props.status);
  };

  handleHotkeyMention = e => {
    e.preventDefault();
    this.handleMentionClick(this.props.status);
  };

  handleHotkeyOpenProfile = () => {
    this.props.history.push(`/@${this.props.status.getIn(['account', 'acct'])}`);
  };

  handleHotkeyTranslate = () => {
    this.handleTranslate(this.props.status);
  };

  handleMoveUp = id => {
    const { status, ancestorsIds, descendantsIds } = this.props;

    if (id === status.get('id')) {
      this._selectChild(ancestorsIds.length - 1, true);
    } else {
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
        this._selectChild(ancestorsIds.length + index, true);
      } else {
        this._selectChild(index - 1, true);
      }
    }
  };

  handleMoveDown = id => {
    const { status, ancestorsIds, descendantsIds } = this.props;

    if (id === status.get('id')) {
      this._selectChild(ancestorsIds.length + 1, false);
    } else {
      let index = ancestorsIds.indexOf(id);

      if (index === -1) {
        index = descendantsIds.indexOf(id);
        this._selectChild(ancestorsIds.length + index + 2, false);
      } else {
        this._selectChild(index + 1, false);
      }
    }
  };

  _selectChild (index, align_top) {
    const container = this.node;
    const element = container.querySelectorAll('.focusable')[index];

    if (element) {
      if (align_top && container.scrollTop > element.offsetTop) {
        element.scrollIntoView(true);
      } else if (!align_top && container.scrollTop + container.clientHeight < element.offsetTop + element.offsetHeight) {
        element.scrollIntoView(false);
      }
      element.focus();
    }
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  };

  renderChildren (list, ancestors) {
    const { params: { statusId } } = this.props;

    return list.map((id, i) => (
      <StatusQuoteManager
        key={id}
        id={id}
        expanded={this.state.threadExpanded}
        onMoveUp={this.handleMoveUp}
        onMoveDown={this.handleMoveDown}
        contextType='thread'
        previousId={i > 0 ? list[i - 1] : undefined}
        nextId={list[i + 1] || (ancestors && statusId)}
        rootId={statusId}
      />
    ));
  }

  setExpansion = value => {
    this.setState({ isExpanded: value });
  };

  setContainerRef = c => {
    this.node = c;
  };

  setColumnRef = c => {
    this.column = c;
  };

  setStatusRef = c => {
    this.statusNode = c;
  };

  _scrollStatusIntoView () {
    const { status, multiColumn } = this.props;

    if (status) {
      requestIdleCallback(() => {
        this.statusNode?.scrollIntoView(true);

        // In the single-column interface, `scrollIntoView` will put the post behind the header,
        // so compensate for that.
        if (!multiColumn) {
          const offset = document.querySelector('.column-header__wrapper')?.getBoundingClientRect()?.bottom;
          if (offset) {
            const scrollingElement = document.scrollingElement || document.body;
            scrollingElement.scrollBy(0, -offset);
          }
        }
      });
    }
  }

  componentDidUpdate (prevProps) {
    const { status, ancestorsIds } = this.props;

    if (status && (ancestorsIds.length > prevProps.ancestorsIds.length || prevProps.status?.get('id') !== status.get('id'))) {
      this._scrollStatusIntoView();
    }
  }

  componentWillUnmount () {
    detachFullscreenListener(this.onFullScreenChange);
  }

  onFullScreenChange = () => {
    this.setState({ fullscreen: isFullscreen() });
  };

  shouldUpdateScroll = (prevRouterProps, { location }) => {
    // Do not change scroll when opening a modal
    if (location.state?.mastodonModalKey !== prevRouterProps?.location?.state?.mastodonModalKey) {
      return false;
    }

    // Scroll to focused post if it is loaded
    if (this.statusNode) {
      return [0, this.statusNode.offsetTop];
    }

    // Do not scroll otherwise, `componentDidUpdate` will take care of that
    return false;
  };

  render () {
    let ancestors, descendants, remoteHint;
    const { isLoading, status, settings, ancestorsIds, descendantsIds, refresh, intl, domain, multiColumn, pictureInPicture } = this.props;
    const { fullscreen } = this.state;

    if (isLoading) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    if (status === null) {
      return (
        <BundleColumnError multiColumn={multiColumn} errorType='routing' />
      );
    }

    const isExpanded = settings.getIn(['content_warnings', 'shared_state']) ? !status.get('hidden') : this.state.isExpanded;

    if (ancestorsIds && ancestorsIds.length > 0) {
      ancestors = <>{this.renderChildren(ancestorsIds, true)}</>;
    }

    if (descendantsIds && descendantsIds.length > 0) {
      descendants = <>{this.renderChildren(descendantsIds)}</>;
    }

    const isLocal = status.getIn(['account', 'acct'], '').indexOf('@') === -1;
    const isIndexable = !status.getIn(['account', 'noindex']);

    if (!isLocal) {
      remoteHint = (
        <RefreshController
          statusId={status.get('id')}
        />
      );
    }

    const handlers = {
      moveUp: this.handleHotkeyMoveUp,
      moveDown: this.handleHotkeyMoveDown,
      reply: this.handleHotkeyReply,
      favourite: this.handleHotkeyFavourite,
      boost: this.handleHotkeyBoost,
      bookmark: this.handleHotkeyBookmark,
      mention: this.handleHotkeyMention,
      openProfile: this.handleHotkeyOpenProfile,
      toggleHidden: this.handleToggleHidden,
      toggleSensitive: this.handleHotkeyToggleSensitive,
      openMedia: this.handleHotkeyOpenMedia,
      onTranslate: this.handleHotkeyTranslate,
    };

    return (
      <Column bindToDocument={!multiColumn} ref={this.setColumnRef} label={intl.formatMessage(messages.detailedStatus)}>
        <ColumnHeader
          icon='comment'
          iconComponent={ChatIcon}
          title={intl.formatMessage(messages.tootHeading)}
          onClick={this.handleHeaderClick}
          showBackButton
          multiColumn={multiColumn}
          extraButton={(
            <button type='button' className='column-header__button' title={intl.formatMessage(!isExpanded ? messages.revealAll : messages.hideAll)} aria-label={intl.formatMessage(!isExpanded ? messages.revealAll : messages.hideAll)} onClick={this.handleToggleAll}><Icon id={!isExpanded ? 'eye-slash' : 'eye'} icon={isExpanded ? VisibilityOffIcon : VisibilityIcon} /></button>
          )}
        />

        <ScrollContainer scrollKey='thread' shouldUpdateScroll={this.shouldUpdateScroll}>
          <div className={classNames('scrollable', { fullscreen })} ref={this.setContainerRef}>
            {ancestors}

            <Hotkeys handlers={handlers}>
              <div className={classNames('focusable', 'detailed-status__wrapper', `detailed-status__wrapper-${status.get('visibility')}`)} tabIndex={0} aria-label={textForScreenReader(intl, status, false, isExpanded)} ref={this.setStatusRef}>
                <DetailedStatus
                  key={`details-${status.get('id')}`}
                  status={status}
                  settings={settings}
                  onOpenVideo={this.handleOpenVideo}
                  onOpenMedia={this.handleOpenMedia}
                  expanded={isExpanded}
                  onToggleHidden={this.handleToggleHidden}
                  onTranslate={this.handleTranslate}
                  domain={domain}
                  showMedia={this.state.showMedia}
                  onToggleMediaVisibility={this.handleToggleMediaVisibility}
                  pictureInPicture={pictureInPicture}
                />

                <ActionBar
                  key={`action-bar-${status.get('id')}`}
                  status={status}
                  onReply={this.handleReplyClick}
                  onFavourite={this.handleFavouriteClick}
                  onReblog={this.handleReblogClick}
                  onBookmark={this.handleBookmarkClick}
                  onDelete={this.handleDeleteClick}
                  onEdit={this.handleEditClick}
                  onDirect={this.handleDirectClick}
                  onMention={this.handleMentionClick}
                  onMute={this.handleMuteClick}
                  onMuteConversation={this.handleConversationMuteClick}
                  onBlock={this.handleBlockClick}
                  onReport={this.handleReport}
                  onPin={this.handlePin}
                  onEmbed={this.handleEmbed}
                />
              </div>
            </Hotkeys>

            {remoteHint}
            {descendants}
          </div>
        </ScrollContainer>

        <Helmet>
          <title>{titleFromStatus(intl, status)}</title>
          <meta name='robots' content={(isLocal && isIndexable) ? 'all' : 'noindex'} />
          <link rel='canonical' href={status.get('url')} />
        </Helmet>
      </Column>
    );
  }

}

export default withRouter(injectIntl(connect(makeMapStateToProps)(withIdentity(Status))));
