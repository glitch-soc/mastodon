import { useEffect } from 'react';

import type {
  List as ImmutableList,
  Record as ImmutableRecord,
} from 'immutable';

import {
  fetchAnnouncements,
  showAnnouncements,
} from '@/flavours/glitch/actions/announcements';
import type { ApiAnnouncementJSON } from '@/flavours/glitch/api_types/announcements';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';

type AnnouncementItem = ImmutableRecord<ApiAnnouncementJSON>;

type AnnouncementsState = ImmutableRecord<{
  items: ImmutableList<AnnouncementItem>;
  isLoading: boolean;
  show: boolean;
}>;

export function useHasAnnouncements({
  fetch = true,
}: { fetch?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const hasAnnouncements = useAppSelector(
    (state) =>
      !(state.announcements as AnnouncementsState).get('items').isEmpty(),
  );
  const shouldShowAnnouncements = useAppSelector((state) =>
    (state.announcements as AnnouncementsState).get('show'),
  );
  const unreadAnnouncementCount = useAppSelector((state) =>
    (state.announcements as AnnouncementsState)
      .get('items')
      .count((item) => !item.get('read')),
  );
  const hasUnreadAnnouncements = !!unreadAnnouncementCount;

  useEffect(() => {
    if (hasUnreadAnnouncements) {
      dispatch(showAnnouncements());
    }
  }, [hasUnreadAnnouncements, dispatch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (fetch) {
        dispatch(fetchAnnouncements());
      }
    }, 700);

    return () => {
      clearTimeout(timeout);
    };
  }, [fetch, dispatch]);

  return {
    hasAnnouncements,
    hasUnreadAnnouncements,
    shouldShowAnnouncements,
    unreadAnnouncementCount,
  };
}
