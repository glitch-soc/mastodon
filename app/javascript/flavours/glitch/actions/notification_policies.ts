import { createAction } from '@reduxjs/toolkit';

import {
  apiGetNotificationPolicy,
  apiUpdateNotificationsPolicy,
} from 'flavours/glitch/api/notification_policies';
import type { NotificationPolicy } from 'flavours/glitch/models/notification_policy';
import { createDataLoadingThunk } from 'flavours/glitch/store/typed_functions';

export const fetchNotificationPolicy = createDataLoadingThunk(
  'notificationPolicy/fetch',
  () => apiGetNotificationPolicy(),
);

export const updateNotificationsPolicy = createDataLoadingThunk(
  'notificationPolicy/update',
  (policy: Partial<NotificationPolicy>) => apiUpdateNotificationsPolicy(policy),
);

export const decreasePendingNotificationsCount = createAction<number>(
  'notificationPolicy/decreasePendingNotificationCount',
);
