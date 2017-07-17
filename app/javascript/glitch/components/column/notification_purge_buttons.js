/**
 * Buttons widget for controlling the notification clearing mode.
 * In idle state, the cleaning mode button is shown. When the mode is active,
 * a Confirm and Abort buttons are shown in its place.
 */


//  Package imports  //
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import escapeTextContentForBrowser from 'escape-html';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Mastodon imports  //
import emojify from '../../../mastodon/emoji';
import Permalink from '../../../mastodon/components/permalink';
import AccountContainer from '../../../mastodon/containers/account_container';

//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

const messages = defineMessages({
  enter : { id: 'notification_purge.start', defaultMessage: 'Enter notification cleaning mode' },
  accept : { id: 'notification_purge.confirm', defaultMessage: 'Dismiss selected notifications' },
  abort : { id: 'notification_purge.abort', defaultMessage: 'Leave cleaning mode' },
});

@injectIntl
export default class NotificationPurgeButtons extends ImmutablePureComponent {

  static propTypes = {
    // Nukes all marked notifications
    onDeleteMarkedNotifications : PropTypes.func.isRequired,
    // Enables or disables the mode
    // and also clears the marked status of all notifications
    onStateChange : PropTypes.func.isRequired,
    // Active state, changed via onStateChange()
    active: PropTypes.bool.isRequired,
  };

  onEnterBtnClick = () => {
    this.props.onStateChange(true);
  }

  onAcceptBtnClick = () => {
    this.props.onDeleteMarkedNotifications();
    this.props.onStateChange(false);
  }

  onAbortBtnClick = () => {
    this.props.onStateChange(false);
  }

  render () {
    const { intl, active } = this.props;

    const msgEnter = intl.formatMessage(messages.enter);
    const msgAccept = intl.formatMessage(messages.accept);
    const msgAbort = intl.formatMessage(messages.abort);

    let enterButton, acceptButton, abortButton;

    if (active) {
      acceptButton = (
        <button
          className='active'
          aria-label={msgAccept}
          title={msgAccept}
          onClick={this.onAcceptBtnClick}
        >
          <i className='fa fa-check' />
        </button>
      );
      abortButton = (
        <button
          className='active'
          aria-label={msgAbort}
          title={msgAbort}
          onClick={this.onAbortBtnClick}
        >
          <i className='fa fa-times' />
        </button>
      );
    } else {
      enterButton = (
        <button
          aria-label={msgEnter}
          title={msgEnter}
          onClick={this.onEnterBtnClick}
        >
          <i className='fa fa-eraser' />
        </button>
      );
    }

    return (
      <div className='column-header__notif-cleaning-buttons'>
        {acceptButton}{abortButton}{enterButton}
      </div>
    );
  }

}
