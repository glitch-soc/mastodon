import { FormattedMessage, FormattedNumber } from 'react-intl';

import { NavLink } from 'react-router-dom';
import type { NavLinkProps } from 'react-router-dom';

import InfoIcon from '@/material-icons/400-24px/info.svg?react';
import { Icon } from 'flavours/glitch/components/icon';
import type { Account } from 'flavours/glitch/models/account';

const isStatusesPageActive: NavLinkProps['isActive'] = (match, location) => {
  if (!match) {
    return false;
  }
  return !/\/(followers|following)\/?$/.exec(location.pathname);
};

export const ActionBar: React.FC<{ account: Account }> = ({ account }) => {
  if (account.suspended) {
    return (
      <div>
        <div className='account__disclaimer'>
          <Icon id='info-circle' icon={InfoIcon} />
          <FormattedMessage
            id='account.suspended_disclaimer_full'
            defaultMessage='This user has been suspended by a moderator.'
          />
        </div>
      </div>
    );
  }

  let extraInfo = null;

  if (account.get('acct') !== account.get('username')) {
    extraInfo = (
      <div className='account__disclaimer'>
        <Icon id='info-circle' icon={InfoIcon} />
        <div>
          <FormattedMessage
            id='account.disclaimer_full'
            defaultMessage="Information below may reflect the user's profile incompletely."
          />{' '}
          <a target='_blank' rel='noopener' href={account.get('url')}>
            <FormattedMessage
              id='account.view_full_profile'
              defaultMessage='View full profile'
            />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {extraInfo}

      <div className='account__action-bar'>
        <div className='account__action-bar-links'>
          <NavLink
            isActive={isStatusesPageActive}
            activeClassName='active'
            className='account__action-bar__tab'
            to={`/@${account.get('acct')}`}
          >
            <FormattedMessage
              id='account.posts'
              defaultMessage='Posts'
              tagName='span'
            />
            <strong>
              <FormattedNumber value={account.get('statuses_count')} />
            </strong>
          </NavLink>

          <NavLink
            exact
            activeClassName='active'
            className='account__action-bar__tab'
            to={`/@${account.get('acct')}/following`}
          >
            <FormattedMessage
              id='account.follows'
              defaultMessage='Follows'
              tagName='span'
            />
            <strong>
              <FormattedNumber value={account.get('following_count')} />
            </strong>
          </NavLink>

          <NavLink
            exact
            activeClassName='active'
            className='account__action-bar__tab'
            to={`/@${account.get('acct')}/followers`}
          >
            <FormattedMessage
              id='account.followers'
              defaultMessage='Followers'
              tagName='span'
            />
            <strong>
              {account.get('followers_count') < 0 ? (
                '-'
              ) : (
                <FormattedNumber value={account.get('followers_count')} />
              )}
            </strong>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
