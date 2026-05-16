import type { FC } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import type { MessageDescriptor } from 'react-intl';

import { Link } from 'react-router-dom';

import { Callout } from '@/flavours/glitch/components/callout';
import { DisplayNameSimple } from '@/flavours/glitch/components/display_name/simple';
import { useAccount } from '@/flavours/glitch/hooks/useAccount';
import { useCurrentAccountId } from '@/flavours/glitch/hooks/useAccountId';

import classes from '../styles.module.scss';

export const AccountListHeader: FC<{
  accountId: string;
  total?: number;
  titleText: MessageDescriptor;
}> = ({ accountId, total, titleText }) => {
  const intl = useIntl();
  const account = useAccount(accountId);
  const currentId = useCurrentAccountId();
  return (
    <>
      <h1 className={classes.title}>
        {intl.formatMessage(titleText, {
          name: <DisplayNameSimple account={account} />,
        })}
      </h1>
      {!!total && (
        <h2 className={classes.subtitle}>
          <FormattedMessage
            id='account_list.total'
            defaultMessage='{total, plural, one {# account} other {# accounts}}'
            values={{ total }}
          />
        </h2>
      )}
      {accountId === currentId && account?.hide_collections && (
        <Callout className={classes.callout}>
          <FormattedMessage
            id='account_list.hidden_notice'
            defaultMessage='This is only visible to you. To show this list to others, go to <link>{page} > {modal} > {field}</link>.'
            values={{
              link: (chunks) => <Link to='/profile/edit'>{chunks}</Link>,
              page: (
                <FormattedMessage
                  id='account.edit_profile'
                  defaultMessage='Edit profile'
                />
              ),
              modal: (
                <FormattedMessage
                  id='account_edit.profile_tab.title'
                  defaultMessage='Profile display settings'
                />
              ),
              field: (
                <FormattedMessage
                  id='account_edit.profile_tab.show_relations.title'
                  defaultMessage='Show ‘Followers’ and ‘Following’'
                />
              ),
            }}
          />
        </Callout>
      )}
    </>
  );
};
