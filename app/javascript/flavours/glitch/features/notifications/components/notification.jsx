import PropTypes from 'prop-types';

import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';

import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { HotKeys } from 'react-hotkeys';

import PersonIcon from '@/material-icons/400-24px/person-fill.svg?react';
import PersonAddIcon from '@/material-icons/400-24px/person_add-fill.svg?react';
import { Icon }  from 'flavours/glitch/components/icon';
import { Permalink } from 'flavours/glitch/components/permalink';
import AccountContainer from 'flavours/glitch/containers/account_container';
import StatusContainer from 'flavours/glitch/containers/status_container';
import { WithRouterPropTypes } from 'flavours/glitch/utils/react_router';

import NotificationAdminReportContainer from '../containers/admin_report_container';
import FollowRequestContainer from '../containers/follow_request_container';
import NotificationOverlayContainer from '../containers/overlay_container';

import NotificationAdminSignup from './admin_signup';

const messages = defineMessages({
  follow: { id: 'notification.follow', defaultMessage: '{name} followed you' },
});

const notificationForScreenReader = (intl, message, timestamp) => {
  const output = [message];

  output.push(intl.formatDate(timestamp, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }));

  return output.join(', ');
};

class Notification extends ImmutablePureComponent {
  static propTypes = {
    notification: ImmutablePropTypes.map.isRequired,
    hidden: PropTypes.bool,
    onMoveUp: PropTypes.func.isRequired,
    onMoveDown: PropTypes.func.isRequired,
    onMention: PropTypes.func.isRequired,
    onFavourite: PropTypes.func.isRequired,
    onReblog: PropTypes.func.isRequired,
    onToggleHidden: PropTypes.func.isRequired,
    status: ImmutablePropTypes.map,
    intl: PropTypes.object.isRequired,
    getScrollPosition: PropTypes.func,
    updateScrollBottom: PropTypes.func,
    cacheMediaWidth: PropTypes.func,
    cachedMediaWidth: PropTypes.number,
    onUnmount: PropTypes.func,
    unread: PropTypes.bool,
    ...WithRouterPropTypes,
  };

  handleMoveUp = () => {
    const { notification, onMoveUp } = this.props;
    onMoveUp(notification.get('id'));
  };

  handleMoveDown = () => {
    const { notification, onMoveDown } = this.props;
    onMoveDown(notification.get('id'));
  };

  handleOpen = () => {
    const { notification } = this.props;

    if (notification.get('status')) {
      this.props.history.push(`/@${notification.getIn(['status', 'account', 'acct'])}/${notification.get('status')}`);
    } else {
      this.handleOpenProfile();
    }
  };

  handleOpenProfile = () => {
    const { notification } = this.props;
    this.props.history.push(`/@${notification.getIn(['account', 'acct'])}`);
  };

  handleMention = e => {
    e.preventDefault();

    const { notification, onMention } = this.props;
    onMention(notification.get('account'), this.props.history);
  };

  handleHotkeyFavourite = () => {
    const { status } = this.props;
    if (status) this.props.onFavourite(status);
  };

  handleHotkeyBoost = e => {
    const { status } = this.props;
    if (status) this.props.onReblog(status, e);
  };

  getHandlers () {
    return {
      reply: this.handleMention,
      favourite: this.handleHotkeyFavourite,
      boost: this.handleHotkeyBoost,
      mention: this.handleMention,
      open: this.handleOpen,
      openProfile: this.handleOpenProfile,
      moveUp: this.handleMoveUp,
      moveDown: this.handleMoveDown,
    };
  }

  renderFollow (notification, account, link) {
    const { intl, unread } = this.props;

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-follow focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage(messages.follow, { name: account.get('acct') }), notification.get('created_at'))}>
          <div className='notification__message'>
            <Icon id='user-plus' icon={PersonAddIcon} />

            <span title={notification.get('created_at')}>
              <FormattedMessage id='notification.follow' defaultMessage='{name} followed you' values={{ name: link }} />
            </span>
          </div>

          <AccountContainer id={account.get('id')} hidden={this.props.hidden} />
          <NotificationOverlayContainer notification={notification} />
        </div>
      </HotKeys>
    );
  }

  renderFollowRequest (notification, account, link) {
    const { intl, unread } = this.props;

    return (
      <HotKeys handlers={this.getHandlers()}>
        <div className={classNames('notification notification-follow-request focusable', { unread })} tabIndex={0} aria-label={notificationForScreenReader(intl, intl.formatMessage({ id: 'notification.follow_request', defaultMessage: '{name} has requested to follow you' }, { name: account.get('acct') }), notification.get('created_at'))}>
          <div className='notification__message'>
            <Icon id='user' icon={PersonIcon} />

            <span title={notification.get('created_at')}>
              <FormattedMessage id='notification.follow_request' defaultMessage='{name} has requested to follow you' values={{ name: link }} />
            </span>
          </div>

          <FollowRequestContainer id={account.get('id')} withNote={false} hidden={this.props.hidden} />
          <NotificationOverlayContainer notification={notification} />
        </div>
      </HotKeys>
    );
  }

  renderMention (notification) {
    return (
      <StatusContainer
        id={notification.get('status')}
        containerId={notification.get('id')}
        withDismiss
        hidden={this.props.hidden}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        notification={notification}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        unread={this.props.unread}
        onUnmount={this.props.onUnmount}
      />
    );
  }

  renderFavourite (notification) {
    return (
      <StatusContainer
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='favourite'
        muted
        withDismiss
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        unread={this.props.unread}
      />
    );
  }

  renderReblog (notification) {
    return (
      <StatusContainer
        containerId={notification.get('id')}
        hidden={!!this.props.hidden}
        id={notification.get('status')}
        account={notification.get('account')}
        prepend='reblog'
        muted
        notification={notification}
        onMoveDown={this.handleMoveDown}
        onMoveUp={this.handleMoveUp}
        onMention={this.props.onMention}
        contextType='notifications'
        getScrollPosition={this.props.getScrollPosition}
        updateScrollBottom={this.props.updateScrollBottom}
        cachedMediaWidth={this.props.cachedMediaWidth}
        cacheMediaWidth={this.props.cacheMediaWidth}
        onUnmount={this.props.onUnmount}
        withDismiss
        unread={this.props.unread}
      />
    );
  }

  render () {
    const { notification } = this.props;
    const account          = notification.get('account');
    const displayNameHtml  = { __html: account.get('display_name_html') };
    const link             = (
      <bdi>
        <Permalink
          className='notification__display-name'
          href={`/@${account.get('acct')}`}
          title={account.get('acct')}
          to={`/@${account.get('acct')}`}
          dangerouslySetInnerHTML={displayNameHtml}
        />
      </bdi>
    );

    const {
      hidden,
      onMoveDown,
      onMoveUp,
      onMention,
      getScrollPosition,
      updateScrollBottom,
    } = this.props;

    switch(notification.get('type')) {
    case 'follow':
      return this.renderFollow(notification, account, link);
    case 'follow_request':
      return this.renderFollowRequest(notification, account, link);
    case 'mention':
      return this.renderMention(notification);
    case 'favourite':
      return this.renderFavourite(notification);
    case 'reblog':
      return this.renderReblog(notification);
    case 'status':
      return (
        <StatusContainer
          containerId={notification.get('id')}
          hidden={hidden}
          id={notification.get('status')}
          account={notification.get('account')}
          prepend='status'
          muted
          notification={notification}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onMention={onMention}
          contextType='notifications'
          getScrollPosition={getScrollPosition}
          updateScrollBottom={updateScrollBottom}
          cachedMediaWidth={this.props.cachedMediaWidth}
          cacheMediaWidth={this.props.cacheMediaWidth}
          onUnmount={this.props.onUnmount}
          withDismiss
          unread={this.props.unread}
        />
      );
    case 'poll':
      return (
        <StatusContainer
          containerId={notification.get('id')}
          hidden={hidden}
          id={notification.get('status')}
          account={notification.get('account')}
          prepend='poll'
          muted
          notification={notification}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onMention={onMention}
          contextType='notifications'
          getScrollPosition={getScrollPosition}
          updateScrollBottom={updateScrollBottom}
          cachedMediaWidth={this.props.cachedMediaWidth}
          cacheMediaWidth={this.props.cacheMediaWidth}
          onUnmount={this.props.onUnmount}
          withDismiss
          unread={this.props.unread}
        />
      );
    case 'update':
      return (
        <StatusContainer
          containerId={notification.get('id')}
          hidden={hidden}
          id={notification.get('status')}
          account={notification.get('account')}
          prepend='update'
          muted
          notification={notification}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onMention={onMention}
          contextType='notifications'
          getScrollPosition={getScrollPosition}
          updateScrollBottom={updateScrollBottom}
          cachedMediaWidth={this.props.cachedMediaWidth}
          cacheMediaWidth={this.props.cacheMediaWidth}
          onUnmount={this.props.onUnmount}
          withDismiss
          unread={this.props.unread}
        />
      );
    case 'admin.sign_up':
      return (
        <NotificationAdminSignup
          hidden={hidden}
          id={notification.get('id')}
          account={notification.get('account')}
          notification={notification}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onMention={onMention}
          unread={this.props.unread}
        />
      );
    case 'admin.report':
      return (
        <NotificationAdminReportContainer
          hidden={hidden}
          id={notification.get('id')}
          account={notification.get('account')}
          notification={notification}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onMention={onMention}
          unread={this.props.unread}
        />
      );
    default:
      return null;
    }
  }

}

export default withRouter(injectIntl(Notification));
