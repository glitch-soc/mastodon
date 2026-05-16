import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import { defineMessage, useIntl } from 'react-intl';

import classNames from 'classnames';

import { isStatusVisibility } from '@/flavours/glitch/api_types/statuses';
import type { Account } from '@/flavours/glitch/models/account';
import type { Status } from '@/flavours/glitch/models/status';

import { Avatar } from '../avatar';
import { AvatarOverlay } from '../avatar_overlay';
import type { DisplayNameProps } from '../display_name';
import { LinkedDisplayName } from '../display_name';
import { VisibilityIcon } from '../visibility_icon';

export interface StatusHeaderProps {
  status: Status;
  account?: Account;
  avatarSize?: number;
  children?: ReactNode;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  displayNameProps?: DisplayNameProps;
  onHeaderClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
  featured?: boolean;
}

export type StatusHeaderRenderFn = (args: StatusHeaderProps) => ReactNode;

export const StatusHeader: FC<StatusHeaderProps> = ({
  status,
  account,
  children,
  className,
  avatarSize = 48,
  wrapperProps,
  onHeaderClick,
}) => {
  const statusAccount = status.get('account') as Account | undefined;

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

      {children}
    </header>
  );
};

export const StatusVisibility: FC<{ visibility: unknown }> = ({
  visibility,
}) => {
  if (typeof visibility !== 'string' || !isStatusVisibility(visibility)) {
    return null;
  }
  return (
    <span className='status__visibility-icon'>
      <VisibilityIcon visibility={visibility} />
    </span>
  );
};

const editMessage = defineMessage({
  id: 'status.edited',
  defaultMessage: 'Edited {date}',
});

export const StatusEditedAt: FC<{ editedAt: string }> = ({ editedAt }) => {
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

export const StatusDisplayName: FC<{
  statusAccount?: Account;
  friendAccount?: Account;
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
