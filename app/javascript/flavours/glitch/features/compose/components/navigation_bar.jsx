import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { Avatar } from 'flavours/glitch/components/avatar';
import Permalink from 'flavours/glitch/components/permalink';
import { profileLink } from 'flavours/glitch/utils/backend_links';

import ActionBar from './action_bar';

export default class NavigationBar extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    onLogout: PropTypes.func.isRequired,
  };

  render () {
    const username = this.props.account.get('acct');

    return (
      <div className='navigation-bar'>
        <Permalink className='avatar' href={this.props.account.get('url')} to={`/@${username}`}>
          <span style={{ display: 'none' }}>{username}</span>
          <Avatar account={this.props.account} size={48} />
        </Permalink>

        <div className='navigation-bar__profile'>
          <span>
            <Permalink className='acct' href={this.props.account.get('url')} to={`/@${username}`}>
              <strong>@{username}</strong>
            </Permalink>
          </span>
          { profileLink !== undefined && (
            <span>
              <a
                className='edit'
                href={profileLink}
              ><FormattedMessage id='navigation_bar.edit_profile' defaultMessage='Edit profile' /></a>
            </span>
          )}
        </div>

        <div className='navigation-bar__actions'>
          <ActionBar account={this.props.account} onLogout={this.props.onLogout} />
        </div>
      </div>
    );
  }

}
