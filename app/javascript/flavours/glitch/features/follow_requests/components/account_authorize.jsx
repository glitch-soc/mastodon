import PropTypes from 'prop-types';

import { defineMessages } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import CheckIcon from '@/material-icons/400-24px/check.svg?react';
import CloseIcon from '@/material-icons/400-24px/close.svg?react';

import { AccountBio } from '@/flavours/glitch/components/account_bio';
import { Avatar } from '@/flavours/glitch/components/avatar';
import { DisplayName } from '@/flavours/glitch/components/display_name';
import { IconButton } from '@/flavours/glitch/components/icon_button';
import { injectIntl } from '@/flavours/glitch/components/intl';
import { Permalink } from '@/flavours/glitch/components/permalink';

const messages = defineMessages({
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
});

class AccountAuthorize extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.record.isRequired,
    onAuthorize: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  render () {
    const { intl, account, onAuthorize, onReject } = this.props;

    return (
      <div className='account-authorize__wrapper'>
        <div className='account-authorize'>
          <Permalink href={account.get('url')} to={`/@${account.get('acct')}`} className='detailed-status__display-name'>
            <div className='account-authorize__avatar'><Avatar account={account} size={48} /></div>
            <DisplayName account={account} />
          </Permalink>

          <AccountBio accountId={account.id} />
        </div>

        <div className='account--panel'>
          <div className='account--panel__button'><IconButton title={intl.formatMessage(messages.authorize)} icon='check' iconComponent={CheckIcon} onClick={onAuthorize} /></div>
          <div className='account--panel__button'><IconButton title={intl.formatMessage(messages.reject)} icon='times' iconComponent={CloseIcon} onClick={onReject} /></div>
        </div>
      </div>
    );
  }

}

export default injectIntl(AccountAuthorize);
