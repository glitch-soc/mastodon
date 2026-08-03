import type { ComponentPropsWithoutRef, FC } from 'react';

import type { LinkProps } from 'react-router-dom';

import type {
  Account,
  AccountShapeFull,
} from '@/flavours/glitch/models/account';
import { Permalink } from 'flavours/glitch/components/permalink';

import { DisplayNameDefault } from './default';
import { DisplayNameWithoutDomain } from './no-domain';
import { DisplayNameSimple } from './simple';

export interface DisplayNameProps {
  account?: Account | AccountShapeFull;
  localDomain?: string;
  variant?: 'default' | 'simple' | 'noDomain';
}

export const DisplayName: FC<
  DisplayNameProps & ComponentPropsWithoutRef<'span'>
> = ({ variant = 'default', ...props }) => {
  if (variant === 'simple') {
    return <DisplayNameSimple {...props} />;
  } else if (variant === 'noDomain') {
    return <DisplayNameWithoutDomain {...props} />;
  }
  return <DisplayNameDefault {...props} />;
};

export const LinkedDisplayName: FC<
  Omit<LinkProps, 'to'> & {
    displayProps: DisplayNameProps & ComponentPropsWithoutRef<'span'>;
  }
> = ({ displayProps, children, ...linkProps }) => {
  const { account } = displayProps;
  if (!account) {
    return <DisplayName {...displayProps} />;
  }

  return (
    <Permalink
      href={account.url}
      to={`/@${account.acct}`}
      title={`@${account.acct}`}
      data-id={account.id}
      data-hover-card-account={account.id}
      {...linkProps}
    >
      {children}
      <DisplayName {...displayProps} />
    </Permalink>
  );
};
