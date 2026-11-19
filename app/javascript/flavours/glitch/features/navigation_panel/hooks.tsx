import { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import type { Map as ImmutableMap } from 'immutable';

import { fetchFollowRequests } from '@/flavours/glitch/actions/accounts';
import { fetchLists } from '@/flavours/glitch/actions/lists';
import { fetchFollowedHashtags } from '@/flavours/glitch/actions/tags_typed';
import { useIdentity } from '@/flavours/glitch/identity_context';
import {
  localLiveFeedAccess,
  remoteLiveFeedAccess,
} from '@/flavours/glitch/initial_state';
import { canViewFeed } from '@/flavours/glitch/permissions';
import { getOrderedLists } from '@/flavours/glitch/selectors/lists';
import { selectUnreadNotificationGroupsCount } from '@/flavours/glitch/selectors/notifications';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';
import FediIcon from '@/images/icons/icon_fediverse.svg?react';

import { useHasAnnouncements } from '../announcements/hooks';

export function useCustomFeeds() {
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();
  const customFeeds = useAppSelector((state) => getOrderedLists(state));

  useEffect(() => {
    if (signedIn) {
      void dispatch(fetchLists());
    }
  }, [dispatch, signedIn]);

  return {
    customFeeds,
  };
}

export function useFollowedHashtags() {
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();
  const { tags, stale } = useAppSelector((state) => state.followedTags);

  useEffect(() => {
    if (stale && signedIn) {
      void dispatch(fetchFollowedHashtags());
    }
  }, [dispatch, stale, signedIn]);

  return { followedHashtags: tags };
}

export function useFollowRequestsCount({
  fetch = true,
}: { fetch?: boolean } = {}) {
  const followRequestsCount = useAppSelector(
    (state) =>
      (
        state.user_lists.getIn(['follow_requests', 'items']) as
          | ImmutableMap<string, unknown>
          | undefined
      )?.size ?? 0,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fetch) {
      dispatch(fetchFollowRequests());
    }
  }, [dispatch, fetch]);

  return followRequestsCount;
}

export function useNotificationsCount() {
  const unreadNotificationsCount = useAppSelector(
    selectUnreadNotificationGroupsCount,
  );
  const { signedIn } = useIdentity();
  const followRequestsCount = useFollowRequestsCount({ fetch: signedIn });

  const { unreadAnnouncementCount } = useHasAnnouncements({ fetch: signedIn });

  return (
    unreadNotificationsCount + followRequestsCount + unreadAnnouncementCount
  );
}

const isFediverseFeedsLinkActive = (
  match: unknown,
  { pathname }: { pathname: string },
) => {
  return !!match || pathname.startsWith('/public');
};

export function usePublicFeedsLink() {
  const { signedIn, permissions } = useIdentity();

  const canViewLocalFeed = canViewFeed(
    signedIn,
    permissions,
    localLiveFeedAccess,
  );
  const canViewRemoteFeed = canViewFeed(
    signedIn,
    permissions,
    remoteLiveFeedAccess,
  );

  if (!canViewLocalFeed && !canViewRemoteFeed) {
    return null;
  }

  const canViewOnlyOneFeed = canViewLocalFeed !== canViewRemoteFeed;

  return {
    link: canViewLocalFeed ? '/public/local' : '/public/remote',
    icon: FediIcon,
    isActive: isFediverseFeedsLinkActive,
    label: canViewOnlyOneFeed ? (
      <FormattedMessage
        id='tabs_bar.public_feed'
        defaultMessage='Public Feed'
      />
    ) : (
      <FormattedMessage
        id='tabs_bar.public_feeds'
        defaultMessage='Public Feeds'
      />
    ),
  };
}
