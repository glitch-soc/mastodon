import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import { defineMessage, useIntl } from 'react-intl';

import classNames from 'classnames';

import type {
  Account,
  AccountShapeFull,
} from '@/flavours/glitch/models/account';
import { selectAccountStatus } from '@/flavours/glitch/selectors/statuses';
import { useAppSelector } from '@/flavours/glitch/store';

import { Avatar } from '../avatar';
import { AvatarOverlay } from '../avatar_overlay';
import type { DisplayNameProps } from '../display_name';
import { LinkedDisplayName } from '../display_name';

export interface StatusHeaderProps {
  statusId: string;
  account?: Account | AccountShapeFull;
  avatarSize?: number;
  contentBeforeDate?: ReactNode;
  contentAfterDate?: ReactNode;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  displayNameProps?: DisplayNameProps;
  onHeaderClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  featured?: boolean;
}

export type StatusHeaderRenderFn = (args: StatusHeaderProps) => ReactNode;

export const StatusHeader: FC<StatusHeaderProps> = ({
  statusId,
  account,
  className,
  avatarSize = 48,
  wrapperProps,
  contentBeforeDate,
  contentAfterDate,
  onHeaderClick,
}) => {
  const status = useAppSelector((state) =>
    selectAccountStatus(state, statusId),
  );
  if (!status) {
    return null;
  }
  const statusAccount = status.account;

  return (
    /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    <header
      onClick={onHeaderClick}
      onAuxClick={onHeaderClick}
      {...wrapperProps}
      className={classNames('status__info', className)}
      /* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */
    >
      <StatusDisplayName
        statusAccount={statusAccount}
        friendAccount={account}
        avatarSize={avatarSize}
      />

      {contentBeforeDate}
      {contentAfterDate}
    </header>
  );
};

const editMessage = defineMessage({
  id: 'status.edited',
  defaultMessage: 'Edited {date}',
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unused in glitch-soc but that might change
const StatusEditedAt: FC<{ editedAt: string }> = ({ editedAt }) => {
  const intl = useIntl();
  return (
    <abbr
      title={intl.formatMessage(editMessage, {
        date: intl.formatDate(editedAt, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })}
    >
      {' '}
      *
    </abbr>
  );
};

const StatusDisplayName: FC<{
  statusAccount?: AccountShapeFull;
  friendAccount?: Account | AccountShapeFull;
  avatarSize: number;
}> = ({ statusAccount, friendAccount, avatarSize }) => {
  const AccountComponent = friendAccount ? AvatarOverlay : Avatar;
  return (
    <LinkedDisplayName
      displayProps={{ account: statusAccount }}
      className='status__display-name'
    >
      <div className='status__avatar'>
        <AccountComponent
          account={statusAccount}
          friend={friendAccount}
          size={avatarSize}
        />
      </div>
    </LinkedDisplayName>
  );
};
