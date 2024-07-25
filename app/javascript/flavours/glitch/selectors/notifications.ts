import { createSelector } from '@reduxjs/toolkit';

import { compareId } from 'flavours/glitch/compare_id';
import type { RootState } from 'flavours/glitch/store';

export const selectUnreadNotificationGroupsCount = createSelector(
  [
    (s: RootState) => s.notificationGroups.lastReadId,
    (s: RootState) => s.notificationGroups.pendingGroups,
    (s: RootState) => s.notificationGroups.groups,
  ],
  (notificationMarker, pendingGroups, groups) => {
    return (
      groups.filter(
        (group) =>
          group.type !== 'gap' &&
          group.page_max_id &&
          compareId(group.page_max_id, notificationMarker) > 0,
      ).length +
      pendingGroups.filter(
        (group) =>
          group.type !== 'gap' &&
          group.page_max_id &&
          compareId(group.page_max_id, notificationMarker) > 0,
      ).length
    );
  },
);

export const selectPendingNotificationGroupsCount = createSelector(
  [(s: RootState) => s.notificationGroups.pendingGroups],
  (pendingGroups) =>
    pendingGroups.filter((group) => group.type !== 'gap').length,
);
