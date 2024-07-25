import { createAction } from '@reduxjs/toolkit';

import {
  apiClearNotifications,
  apiFetchNotifications,
} from 'flavours/glitch/api/notifications';
import type { ApiAccountJSON } from 'flavours/glitch/api_types/accounts';
import type {
  ApiNotificationGroupJSON,
  ApiNotificationJSON,
} from 'flavours/glitch/api_types/notifications';
import { allNotificationTypes } from 'flavours/glitch/api_types/notifications';
import type { ApiStatusJSON } from 'flavours/glitch/api_types/statuses';
import type { NotificationGap } from 'flavours/glitch/reducers/notification_groups';
import {
  selectSettingsNotificationsExcludedTypes,
  selectSettingsNotificationsQuickFilterActive,
} from 'flavours/glitch/selectors/settings';
import type { AppDispatch } from 'flavours/glitch/store';
import {
  createAppAsyncThunk,
  createDataLoadingThunk,
} from 'flavours/glitch/store/typed_functions';

import { importFetchedAccounts, importFetchedStatuses } from './importer';
import { NOTIFICATIONS_FILTER_SET } from './notifications';
import { saveSettings } from './settings';

function excludeAllTypesExcept(filter: string) {
  return allNotificationTypes.filter((item) => item !== filter);
}

function dispatchAssociatedRecords(
  dispatch: AppDispatch,
  notifications: ApiNotificationGroupJSON[] | ApiNotificationJSON[],
) {
  const fetchedAccounts: ApiAccountJSON[] = [];
  const fetchedStatuses: ApiStatusJSON[] = [];

  notifications.forEach((notification) => {
    if ('sample_accounts' in notification) {
      fetchedAccounts.push(...notification.sample_accounts);
    }

    if (notification.type === 'admin.report') {
      fetchedAccounts.push(notification.report.target_account);
    }

    if (notification.type === 'moderation_warning') {
      fetchedAccounts.push(notification.moderation_warning.target_account);
    }

    if ('status' in notification) {
      fetchedStatuses.push(notification.status);
    }
  });

  if (fetchedAccounts.length > 0)
    dispatch(importFetchedAccounts(fetchedAccounts));

  if (fetchedStatuses.length > 0)
    dispatch(importFetchedStatuses(fetchedStatuses));
}

export const fetchNotifications = createDataLoadingThunk(
  'notificationGroups/fetch',
  async (_params, { getState }) => {
    const activeFilter =
      selectSettingsNotificationsQuickFilterActive(getState());

    return apiFetchNotifications({
      exclude_types:
        activeFilter === 'all'
          ? selectSettingsNotificationsExcludedTypes(getState())
          : excludeAllTypesExcept(activeFilter),
    });
  },
  ({ notifications }, { dispatch }) => {
    dispatchAssociatedRecords(dispatch, notifications);
    const payload: (ApiNotificationGroupJSON | NotificationGap)[] =
      notifications;

    // TODO: might be worth not using gaps for that…
    // if (nextLink) payload.push({ type: 'gap', loadUrl: nextLink.uri });
    if (notifications.length > 1)
      payload.push({ type: 'gap', maxId: notifications.at(-1)?.page_min_id });

    return payload;
    // dispatch(submitMarkers());
  },
);

export const fetchNotificationsGap = createDataLoadingThunk(
  'notificationGroups/fetchGap',
  async (params: { gap: NotificationGap }) =>
    apiFetchNotifications({ max_id: params.gap.maxId }),

  ({ notifications }, { dispatch }) => {
    dispatchAssociatedRecords(dispatch, notifications);

    return { notifications };
  },
);

export const processNewNotificationForGroups = createAppAsyncThunk(
  'notificationGroups/processNew',
  (notification: ApiNotificationJSON, { dispatch }) => {
    dispatchAssociatedRecords(dispatch, [notification]);

    return notification;
  },
);

export const loadPending = createAction('notificationGroups/loadPending');

export const updateScrollPosition = createAction<{ top: boolean }>(
  'notificationGroups/updateScrollPosition',
);

export const setNotificationsFilter = createAppAsyncThunk(
  'notifications/filter/set',
  ({ filterType }: { filterType: string }, { dispatch }) => {
    dispatch({
      type: NOTIFICATIONS_FILTER_SET,
      path: ['notifications', 'quickFilter', 'active'],
      value: filterType,
    });
    // dispatch(expandNotifications({ forceLoad: true }));
    void dispatch(fetchNotifications());
    dispatch(saveSettings());
  },
);

export const clearNotifications = createDataLoadingThunk(
  'notifications/clear',
  () => apiClearNotifications(),
);

export const markNotificationsAsRead = createAction(
  'notificationGroups/markAsRead',
);

export const mountNotifications = createAction('notificationGroups/mount');
export const unmountNotifications = createAction('notificationGroups/unmount');
