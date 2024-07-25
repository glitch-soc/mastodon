import { useMemo } from 'react';

import classNames from 'classnames';

import { HotKeys } from 'react-hotkeys';

import { replyComposeById } from 'flavours/glitch/actions/compose';
import {
  toggleReblog,
  toggleFavourite,
} from 'flavours/glitch/actions/interactions';
import {
  navigateToStatus,
  toggleStatusSpoilers,
} from 'flavours/glitch/actions/statuses';
import type { IconProp } from 'flavours/glitch/components/icon';
import { Icon } from 'flavours/glitch/components/icon';
import Status from 'flavours/glitch/containers/status_container';
import { useAppSelector, useAppDispatch } from 'flavours/glitch/store';

import { NamesList } from './names_list';
import type { LabelRenderer } from './notification_group_with_status';

export const NotificationWithStatus: React.FC<{
  type: string;
  icon: IconProp;
  iconId: string;
  accountIds: string[];
  statusId: string;
  count: number;
  labelRenderer: LabelRenderer;
  unread: boolean;
}> = ({
  icon,
  iconId,
  accountIds,
  statusId,
  count,
  labelRenderer,
  type,
  unread,
}) => {
  const dispatch = useAppDispatch();

  const label = useMemo(
    () =>
      labelRenderer({
        name: <NamesList accountIds={accountIds} total={count} />,
      }),
    [labelRenderer, accountIds, count],
  );

  const isPrivateMention = useAppSelector(
    (state) => state.statuses.getIn([statusId, 'visibility']) === 'direct',
  );

  const handlers = useMemo(
    () => ({
      open: () => {
        dispatch(navigateToStatus(statusId));
      },

      reply: () => {
        dispatch(replyComposeById(statusId));
      },

      boost: () => {
        dispatch(toggleReblog(statusId));
      },

      favourite: () => {
        dispatch(toggleFavourite(statusId));
      },

      toggleHidden: () => {
        // TODO: glitch-soc is different and needs different handling of CWs
        dispatch(toggleStatusSpoilers(statusId));
      },
    }),
    [dispatch, statusId],
  );

  return (
    <HotKeys handlers={handlers}>
      <div
        role='button'
        className={classNames(
          `notification-ungrouped focusable notification-ungrouped--${type}`,
          {
            'notification-ungrouped--unread': unread,
            'notification-ungrouped--direct': isPrivateMention,
          },
        )}
        tabIndex={0}
      >
        <div className='notification-ungrouped__header'>
          <div className='notification-ungrouped__header__icon'>
            <Icon icon={icon} id={iconId} />
          </div>
          {label}
        </div>

        <Status
          // @ts-expect-error -- <Status> is not yet typed
          id={statusId}
          contextType='notifications'
          withDismiss
          skipPrepend
          avatarSize={40}
          unfocusable
        />
      </div>
    </HotKeys>
  );
};
