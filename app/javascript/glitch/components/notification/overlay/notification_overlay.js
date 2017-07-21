/**
 * Notification overlay
 */


//  Package imports  //
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Mastodon imports  //

//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

export default class NotificationOverlay extends ImmutablePureComponent {

  static propTypes = {
    notification: ImmutablePropTypes.map.isRequired,
    onMarkForDelete: PropTypes.func.isRequired,
    revealed: PropTypes.bool.isRequired,
  };

  onToggleMark = () => {
    const mark = !this.props.notification.get('markedForDelete');
    const id = this.props.notification.get('id');
    this.props.onMarkForDelete(id, mark);
  }

  render () {
    const { notification, revealed } = this.props;

   
    return (
      <div
        aria-label='Dismiss notification'
        role='button'
        tabIndex={0}
        className={`notification__dismiss-overlay ${notification.get('markedForDelete') ? 'active' : ''} ${revealed ? 'show' : ''}`}
        onClick={this.onToggleMark}
      />
    );
  }

}
