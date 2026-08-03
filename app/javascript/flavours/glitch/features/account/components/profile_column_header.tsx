import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import PersonIcon from '@/material-icons/400-24px/person.svg?react';

import { ColumnHeader } from '../../../components/column_header';

const messages = defineMessages({
  profile: { id: 'column_header.profile', defaultMessage: 'Profile' },
});

interface ProfileColumnHeaderProps {
  onClick: () => void;
  multiColumn: boolean;
}

export const ProfileColumnHeader: FC<ProfileColumnHeaderProps> = ({
  onClick,
  multiColumn,
}) => {
  const intl = useIntl();

  return (
    <ColumnHeader
      icon='user-circle'
      iconComponent={PersonIcon}
      title={intl.formatMessage(messages.profile)}
      onClick={onClick}
      showBackButton
      multiColumn={multiColumn}
    />
  );
};
