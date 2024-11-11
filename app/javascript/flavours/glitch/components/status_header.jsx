//  Package imports.
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import ImmutablePropTypes from 'react-immutable-proptypes';

//  Mastodon imports.
import { Avatar } from './avatar';
import { AvatarOverlay } from './avatar_overlay';
import { DisplayName } from './display_name';

export default class StatusHeader extends PureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    friend: ImmutablePropTypes.map,
    avatarSize: PropTypes.number,
    parseClick: PropTypes.func.isRequired,
  };

  handleAccountClick = (e) => {
    const { status, parseClick } = this.props;
    parseClick(e, `/@${status.getIn(['account', 'acct'])}`);
    e.stopPropagation();
  };

  //  Rendering.
  render () {
    const {
      status,
      friend,
      avatarSize,
    } = this.props;

    const account = status.get('account');

    let statusAvatar;
    if (friend === undefined || friend === null) {
      statusAvatar = <Avatar account={account} size={avatarSize} />;
    } else {
      statusAvatar = <AvatarOverlay account={account} friend={friend} />;
    }

    return (
      <a
        href={account.get('url')}
        className='status__display-name'
        target='_blank'
        onClick={this.handleAccountClick}
        rel='noopener noreferrer'
        title={status.getIn(['account', 'acct'])}
        data-hover-card-account={status.getIn(['account', 'id'])}
      >
        <div className='status__avatar'>
          {statusAvatar}
        </div>

        <DisplayName account={account} />
      </a>
    );
  }

}
