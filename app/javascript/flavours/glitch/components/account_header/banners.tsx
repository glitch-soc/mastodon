import { useCallback } from 'react';
import type { FC, ReactElement, ReactNode } from 'react';

import { FormattedMessage } from 'react-intl';

import { CheckIcon, XIcon } from '@phosphor-icons/react';

import {
  authorizeFollowRequest,
  rejectFollowRequest,
} from '@/flavours/glitch/actions/accounts';
import { AvatarOverlay } from '@/flavours/glitch/components/avatar_overlay';
import { Button } from '@/flavours/glitch/components/button/redesign';
import { DisplayName } from '@/flavours/glitch/components/display_name';
import { useAccountVisibility } from '@/flavours/glitch/hooks/useAccountVisibility';
import { useRelationship } from '@/flavours/glitch/hooks/useRelationship';
import type { Account } from '@/flavours/glitch/models/account';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';

import { Permalink } from '../permalink';

import classes from './styles.module.scss';

export const AccountBanners: FC<{ account: Account }> = ({ account }) => {
  const { suspended, hidden } = useAccountVisibility(account.id);
  const relationship = useRelationship(account.id);

  if (hidden) {
    return null;
  }

  let banner: ReactNode = null;

  if (account.memorial) {
    banner = (
      <MessageText>
        <FormattedMessage
          id='account.in_memoriam'
          defaultMessage='In Memoriam.'
        />
      </MessageText>
    );
  }

  if (account.moved) {
    banner = <MovedNote account={account} targetAccountId={account.moved} />;
  }

  if (!suspended && relationship?.requested_by) {
    banner = <FollowRequestNote account={account} />;
  }

  if (!banner) {
    return null;
  }

  return <div className={classes.bannerWrapper}>{banner}</div>;
};

const FollowRequestNote: FC<{ account: Account }> = ({ account }) => {
  const accountId = account.id;
  const dispatch = useAppDispatch();
  const handleAuthorize = useCallback(() => {
    dispatch(authorizeFollowRequest(accountId));
  }, [accountId, dispatch]);
  const handleReject = useCallback(() => {
    dispatch(rejectFollowRequest(accountId));
  }, [accountId, dispatch]);

  return (
    <>
      <MessageText>
        <FormattedMessage
          id='account.requested_follow'
          defaultMessage='{name} has requested to follow you'
          values={{ name: <DisplayName account={account} variant='simple' /> }}
        />
      </MessageText>

      <div className={classes.bannerActions}>
        <Button onClick={handleAuthorize} leadingIcon={CheckIcon} size='sm'>
          <FormattedMessage
            id='follow_request.authorize'
            defaultMessage='Authorize'
          />
        </Button>

        <Button onClick={handleReject} leadingIcon={XIcon} size='sm'>
          <FormattedMessage
            id='follow_request.reject'
            defaultMessage='Reject'
          />
        </Button>
      </div>
    </>
  );
};

const MovedNote: React.FC<{
  account: Account;
  targetAccountId: string;
}> = ({ account: from, targetAccountId }) => {
  const to = useAppSelector((state) => state.accounts.get(targetAccountId));

  return (
    <>
      <MessageText>
        <FormattedMessage
          id='account.moved_to'
          defaultMessage='{name} has indicated that their new account is now:'
          values={{
            name: <DisplayName account={from} variant='simple' />,
          }}
        />
      </MessageText>

      <div className={classes.bannerActions}>
        <Permalink
          to={`/@${to?.acct}`}
          href={to?.url}
          className={classes.bannerActionsDisplayName}
        >
          <div className='detailed-status__display-avatar'>
            <AvatarOverlay account={to} friend={from} />
          </div>
          <DisplayName account={to} />
        </Permalink>

        <Permalink to={`/@${to?.acct}`} href={to?.url} className='button'>
          <FormattedMessage
            id='account.go_to_profile'
            defaultMessage='Go to profile'
          />
        </Permalink>
      </div>
    </>
  );
};

const MessageText: React.FC<{ children: ReactElement }> = ({ children }) => (
  <div className={classes.bannerText}>{children}</div>
);
