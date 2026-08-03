import { FormattedMessage } from 'react-intl';

import { EmojiHTML } from '@/flavours/glitch/components/emoji/html';
import { Avatar } from 'flavours/glitch/components/avatar';
import { DisplayName } from 'flavours/glitch/components/display_name';
import { FollowButton } from 'flavours/glitch/components/follow_button';
import { Permalink } from 'flavours/glitch/components/permalink';
import { ShortNumber } from 'flavours/glitch/components/short_number';
import { autoPlayGif } from 'flavours/glitch/initial_state';
import type { Account } from 'flavours/glitch/models/account';
import { makeGetAccount } from 'flavours/glitch/selectors';
import { useAppSelector } from 'flavours/glitch/store';

const getAccount = makeGetAccount();

export const AccountCard: React.FC<{ accountId: string }> = ({ accountId }) => {
  const account = useAppSelector((s) => getAccount(s, accountId));

  if (!account) return null;

  return (
    <div className='account-card'>
      <Permalink
        href={account.get('url')}
        to={`/@${account.get('acct')}`}
        className='account-card__permalink'
      >
        <div className='account-card__header'>
          <img
            src={
              autoPlayGif ? account.get('header') : account.get('header_static')
            }
            alt=''
          />
        </div>

        <div className='account-card__title'>
          <div className='account-card__title__avatar'>
            <Avatar account={account as Account} size={56} />
          </div>
          <DisplayName account={account as Account} />
        </div>
      </Permalink>

      {account.get('note').length > 0 && (
        <EmojiHTML
          className='account-card__bio translate'
          htmlString={account.get('note_emojified')}
          extraEmojis={account.get('emojis')}
        />
      )}

      <div className='account-card__actions'>
        <div className='account-card__counters'>
          <div className='account-card__counters__item'>
            <ShortNumber value={account.get('statuses_count')} />
            <small>
              <FormattedMessage id='account.posts' defaultMessage='Posts' />
            </small>
          </div>

          <div className='account-card__counters__item'>
            <ShortNumber value={account.get('followers_count')} />{' '}
            <small>
              <FormattedMessage
                id='account.followers'
                defaultMessage='Followers'
              />
            </small>
          </div>

          <div className='account-card__counters__item'>
            <ShortNumber value={account.get('following_count')} />{' '}
            <small>
              <FormattedMessage
                id='account.following'
                defaultMessage='Following'
              />
            </small>
          </div>
        </div>

        <div className='account-card__actions__button'>
          <FollowButton accountId={account.get('id')} />
        </div>
      </div>
    </div>
  );
};
