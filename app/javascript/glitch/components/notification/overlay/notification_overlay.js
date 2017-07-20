/**
 * Notification overlay
 */


//  Package imports  //
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import escapeTextContentForBrowser from 'escape-html';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Mastodon imports  //
import emojify from '../../../../mastodon/emoji';
import Permalink from '../../../../mastodon/components/permalink';
import AccountContainer from '../../../../mastodon/containers/account_container';

//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

export default class NotificationOverlay extends ImmutablePureComponent {

  static propTypes = {
    notification: ImmutablePropTypes.map.isRequired,
    onMarkForDelete: PropTypes.func.isRequired,
  };

  onToggleMark = () => {
    console.log('onToggleMark!');
    this.props.onMarkForDelete(
      this.props.notification.get('id'),
      !this.props.notification.get('markedForDelete')
    );
  }

  render () {
    const { notification } = this.props;

    return (
      <div
        aria-label='Dismiss notification'
        role='button'
        tabIndex={0}
        className={`notification__dismiss-overlay ${notification.get('markedForDelete') ? 'active' : ''}`}
        onClick={this.onToggleMark}
      />
    );
  }

}
