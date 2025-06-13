import { useEffect, forwardRef } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import { fetchAccount } from 'flavours/glitch/actions/accounts';
import { AccountBio } from 'flavours/glitch/components/account_bio';
import { AccountFields } from 'flavours/glitch/components/account_fields';
import { Avatar } from 'flavours/glitch/components/avatar';
import { AvatarGroup } from 'flavours/glitch/components/avatar_group';
import {
  FollowersCounter,
  FollowersYouKnowCounter,
} from 'flavours/glitch/components/counters';
import { DisplayName } from 'flavours/glitch/components/display_name';
import { FollowButton } from 'flavours/glitch/components/follow_button';
import { LoadingIndicator } from 'flavours/glitch/components/loading_indicator';
import { Permalink } from 'flavours/glitch/components/permalink';
import { ShortNumber } from 'flavours/glitch/components/short_number';
import { useFetchFamiliarFollowers } from 'flavours/glitch/features/account_timeline/hooks/familiar_followers';
import { domain } from 'flavours/glitch/initial_state';
import { getAccountHidden } from 'flavours/glitch/selectors/accounts';
import { useAppSelector, useAppDispatch } from 'flavours/glitch/store';

export const HoverCardAccount = forwardRef<
  HTMLDivElement,
  { accountId?: string }
>(({ accountId }, ref) => {
  const dispatch = useAppDispatch();

  const account = useAppSelector((state) =>
    accountId ? state.accounts.get(accountId) : undefined,
  );
  const suspended = account?.suspended;
  const hidden = useAppSelector((state) =>
    accountId ? getAccountHidden(state, accountId) : undefined,
  );
  const isSuspendedOrHidden = Boolean(suspended || hidden);

  const note = useAppSelector(
    (state) =>
      state.relationships.getIn([accountId, 'note']) as string | undefined,
  );

  useEffect(() => {
    if (accountId && !account) {
      dispatch(fetchAccount(accountId));
    }
  }, [dispatch, accountId, account]);

  const { familiarFollowers } = useFetchFamiliarFollowers({ accountId });

  const relationship = useAppSelector((state) =>
    accountId ? state.relationships.get(accountId) : undefined,
  );
  const isMutual = relationship?.followed_by && relationship.following;
  const isFollower = relationship?.followed_by;
  const hasRelationshipLoaded = !!relationship;

  const shouldDisplayFamiliarFollowers =
    familiarFollowers.length > 0 &&
    hasRelationshipLoaded &&
    !isMutual &&
    !isFollower;

  return (
    <div
      ref={ref}
      id='hover-card'
      role='tooltip'
      className={classNames('hover-card dropdown-animation', {
        'hover-card--loading': !account,
      })}
    >
      {account ? (
        <>
          <Permalink
            to={`/@${account.acct}`}
            href={account.get('url')}
            className='hover-card__name'
          >
            <Avatar
              account={isSuspendedOrHidden ? undefined : account}
              size={46}
            />
            <DisplayName account={account} localDomain={domain} />
          </Permalink>

          {isSuspendedOrHidden ? (
            <div className='hover-card__limited-account-note'>
              {suspended ? (
                <FormattedMessage
                  id='empty_column.account_suspended'
                  defaultMessage='Account suspended'
                />
              ) : (
                <FormattedMessage
                  id='limited_account_hint.title'
                  defaultMessage='This profile has been hidden by the moderators of {domain}.'
                  values={{ domain }}
                />
              )}
            </div>
          ) : (
            <>
              <div className='hover-card__text-row'>
                <AccountBio
                  note={account.note_emojified}
                  className='hover-card__bio'
                />
                <AccountFields fields={account.fields} limit={2} />
                {note && note.length > 0 && (
                  <dl className='hover-card__note'>
                    <dt className='hover-card__note-label'>
                      <FormattedMessage
                        id='account.account_note_header'
                        defaultMessage='Personal note'
                      />
                    </dt>
                    <dd>{note}</dd>
                  </dl>
                )}
              </div>

              <div className='hover-card__numbers'>
                <ShortNumber
                  value={account.followers_count}
                  renderer={FollowersCounter}
                />
                {shouldDisplayFamiliarFollowers && (
                  <>
                    &middot;
                    <div className='hover-card__familiar-followers'>
                      <ShortNumber
                        value={familiarFollowers.length}
                        renderer={FollowersYouKnowCounter}
                      />
                      <AvatarGroup compact>
                        {familiarFollowers.slice(0, 3).map((account) => (
                          <Avatar
                            key={account.id}
                            account={account}
                            size={22}
                          />
                        ))}
                      </AvatarGroup>
                    </div>
                  </>
                )}
                {(isMutual || isFollower) && (
                  <>
                    &middot;
                    {isMutual ? (
                      <FormattedMessage
                        id='account.mutual'
                        defaultMessage='You follow each other'
                      />
                    ) : (
                      <FormattedMessage
                        id='account.follows_you'
                        defaultMessage='Follows you'
                      />
                    )}
                  </>
                )}
              </div>

              <FollowButton accountId={accountId} />
            </>
          )}
        </>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  );
});

HoverCardAccount.displayName = 'HoverCardAccount';
