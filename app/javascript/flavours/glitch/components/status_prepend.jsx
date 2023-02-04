//  Package imports  //
import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import Icon from 'flavours/glitch/components/icon';
import { me } from 'flavours/glitch/initial_state';
import NameList from './name_list';

export default class StatusPrepend extends React.PureComponent {

  static propTypes = {
    type: PropTypes.string.isRequired,
    status: ImmutablePropTypes.map.isRequired,
    accounts: ImmutablePropTypes.listOf(ImmutablePropTypes.map.isRequired),
    parseClick: PropTypes.func.isRequired,
    notificationId: PropTypes.number,
  };

  handleClick = (acct, e) => {
    const { parseClick } = this.props;
    parseClick(e, `/@${acct.get('acct')}`);
  }

  Message = () => {
    const { type, accounts, status } = this.props;
    let link = (
      <span>
        <NameList
          accounts={accounts}
          viewMoreHref={status.get('url')}
          onAccountClick={this.handleClick}
        />
      </span>
    );
    switch (type) {
    case 'featured':
      return (
        <FormattedMessage id='status.pinned' defaultMessage='Pinned post' />
      );
    case 'reblogged_by':
      return (
        <FormattedMessage
          id='status.reblogged_by'
          defaultMessage='{name} boosted'
          values={{ name : link }}
        />
      );
    case 'favourite':
      return (
        <FormattedMessage
          id='notification.favourite'
          defaultMessage='{name} favourited your status'
          values={{ name : link }}
        />
      );
    case 'reaction':
      return (
        <FormattedMessage
          id='notification.reaction'
          defaultMessage='{name} reacted to your status'
          values={{ name: link }}
        />
      );
    case 'reblog':
      return (
        <FormattedMessage
          id='notification.reblog'
          defaultMessage='{name} boosted your status'
          values={{ name : link }}
        />
      );
    case 'status':
      return (
        <FormattedMessage
          id='notification.status'
          defaultMessage='{name} just posted'
          values={{ name: link }}
        />
      );
    case 'poll':
      if (me === accounts.get(0).get('id')) {
        return (
          <FormattedMessage
            id='notification.own_poll'
            defaultMessage='Your poll has ended'
          />
        );
      } else {
        return (
          <FormattedMessage
            id='notification.poll'
            defaultMessage='A poll you have voted in has ended'
          />
        );
      }
    case 'update':
      return (
        <FormattedMessage
          id='notification.update'
          defaultMessage='{name} edited a post'
          values={{ name: link }}
        />
      );
    }
    return null;
  };

  render () {
    const { Message } = this;
    const { type } = this.props;

    let iconId;

    switch(type) {
    case 'favourite':
      iconId = 'star';
      break;
    case 'reaction':
      iconId = 'plus';
      break;
    case 'featured':
      iconId = 'thumb-tack';
      break;
    case 'poll':
      iconId = 'tasks';
      break;
    case 'reblog':
    case 'reblogged_by':
      iconId = 'retweet';
      break;
    case 'status':
      iconId = 'bell';
      break;
    case 'update':
      iconId = 'pencil';
      break;
    }

    return !type ? null : (
      <aside className={type === 'reblogged_by' || type === 'featured' ? 'status__prepend' : 'notification__message'}>
        <div className={type === 'reblogged_by' || type === 'featured' ? 'status__prepend-icon-wrapper' : 'notification__favourite-icon-wrapper'}>
          <Icon
            className={`status__prepend-icon ${type === 'favourite' ? 'star-icon' : ''}`}
            id={iconId}
          />
        </div>
        <Message />
      </aside>
    );
  }

}
