import { useRef, useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import { importFetchedAccounts } from 'flavours/glitch/actions/importer';
import { apiRequest } from 'flavours/glitch/api';
import type { ApiAccountJSON } from 'flavours/glitch/api_types/accounts';
import { useAppDispatch } from 'flavours/glitch/store';

export function useSearchAccounts({
  resetOnInputClear = true,
  onSettled,
  filterResults,
}: {
  onSettled?: (value: string) => void;
  filterResults?: (account: ApiAccountJSON) => boolean;
  resetOnInputClear?: boolean;
} = {}) {
  const dispatch = useAppDispatch();

  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<
    'idle' | 'loading' | 'error'
  >('idle');

  const searchRequestRef = useRef<AbortController | null>(null);

  const searchAccounts = useDebouncedCallback(
    (value: string) => {
      if (searchRequestRef.current) {
        searchRequestRef.current.abort();
      }

      if (value.trim().length === 0) {
        onSettled?.('');
        if (resetOnInputClear) {
          setAccountIds([]);
        }
        return;
      }

      setLoadingState('loading');

      searchRequestRef.current = new AbortController();

      void apiRequest<ApiAccountJSON[]>('GET', 'v1/accounts/search', {
        signal: searchRequestRef.current.signal,
        params: {
          q: value,
          resolve: true,
        },
      })
        .then((data) => {
          const accounts = filterResults ? data.filter(filterResults) : data;
          dispatch(importFetchedAccounts(accounts));
          setAccountIds(accounts.map((a) => a.id));
          setLoadingState('idle');
          onSettled?.(value);
        })
        .catch(() => {
          setLoadingState('error');
          onSettled?.(value);
        });
    },
    500,
    { leading: true, trailing: true },
  );

  return {
    searchAccounts,
    accountIds,
    isLoading: loadingState === 'loading',
    isError: loadingState === 'error',
  };
}
