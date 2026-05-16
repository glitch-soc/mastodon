import { useCallback, useMemo, useRef } from 'react';
import type { FC, ReactNode } from 'react';

import { AccountListItem } from '@/flavours/glitch/components/account_list_item';
import type { ColumnRef } from '@/flavours/glitch/components/column';
import { Column } from '@/flavours/glitch/components/column';
import { LoadingIndicator } from '@/flavours/glitch/components/loading_indicator';
import ScrollableList from '@/flavours/glitch/components/scrollable_list';
import BundleColumnError from '@/flavours/glitch/features/ui/components/bundle_column_error';
import { useAccount } from '@/flavours/glitch/hooks/useAccount';
import { useAccountVisibility } from '@/flavours/glitch/hooks/useAccountVisibility';
import { useLayout } from '@/flavours/glitch/hooks/useLayout';

import { ProfileColumnHeader } from '../../account/components/profile_column_header';

import { RemoteHint } from './remote';

export interface AccountList {
  hasMore: boolean;
  isLoading: boolean;
  items: string[];
}

interface AccountListProps {
  accountId?: string | null;
  append?: ReactNode;
  emptyMessage: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  list?: AccountList | null;
  loadMore: () => void;
  prependAccountId?: string | null;
  withoutFollowsYouBadge?: boolean;
  scrollKey: string;
}

export const AccountList: FC<AccountListProps> = ({
  accountId,
  append,
  emptyMessage,
  header,
  footer,
  list,
  loadMore,
  prependAccountId,
  withoutFollowsYouBadge,
  scrollKey,
}) => {
  const account = useAccount(accountId);

  const { blockedBy, hidden, suspended } = useAccountVisibility(accountId);
  const forceEmptyState = blockedBy || hidden || suspended;

  const children = useMemo(() => {
    if (forceEmptyState) {
      return [];
    }
    const children =
      list?.items.map((followerId) => (
        <AccountListItem
          key={followerId}
          accountId={followerId}
          withBio={false}
          badge={withoutFollowsYouBadge ? false : null}
        />
      )) ?? [];

    if (prependAccountId) {
      children.unshift(
        <AccountListItem
          key={prependAccountId}
          accountId={prependAccountId}
          withBio={false}
          badge={withoutFollowsYouBadge ? false : null}
        />,
      );
    }
    return children;
  }, [prependAccountId, list, forceEmptyState, withoutFollowsYouBadge]);

  const columnRef = useRef<ColumnRef>(null);
  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const { multiColumn } = useLayout();

  // Null means accountId does not exist (e.g. invalid acct). Undefined means loading.
  if (accountId === null) {
    return <BundleColumnError multiColumn={multiColumn} errorType='routing' />;
  }

  if (!accountId || !account) {
    return (
      <Column bindToDocument={!multiColumn}>
        <LoadingIndicator />
      </Column>
    );
  }

  const domain = account.acct.split('@')[1];

  return (
    <Column ref={columnRef}>
      <ProfileColumnHeader
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      <ScrollableList
        scrollKey={scrollKey}
        hasMore={!forceEmptyState && list?.hasMore}
        isLoading={list?.isLoading ?? true}
        onLoadMore={loadMore}
        prepend={header}
        alwaysPrepend
        append={append ?? <RemoteHint domain={domain} url={account.url} />}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        footer={footer}
      >
        {children}
      </ScrollableList>
    </Column>
  );
};
