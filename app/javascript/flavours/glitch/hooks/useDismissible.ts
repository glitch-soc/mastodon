import { useCallback, useEffect } from 'react';

import type { Map as ImmutableMap } from 'immutable';

import { changeSetting } from '@/flavours/glitch/actions/settings';
import { bannerSettings } from '@/flavours/glitch/settings';
import { useAppSelector, useAppDispatch } from '@/flavours/glitch/store';

export function useDismissible(id: string) {
  // We use "dismissed_banners" as that was what this was previously called,
  // but we can use this to track any dismissible state.
  const dismissed = useAppSelector(
    (state) =>
      !!(
        state.settings as ImmutableMap<
          'dismissed_banners',
          ImmutableMap<string, boolean>
        >
      ).getIn(['dismissed_banners', id], false),
  );

  const wasDismissed = !!bannerSettings.get(id) || dismissed;

  const dispatch = useAppDispatch();

  const dismiss = useCallback(() => {
    bannerSettings.set(id, true);
    dispatch(changeSetting(['dismissed_banners', id], true));
  }, [id, dispatch]);

  useEffect(() => {
    // Store legacy localStorage setting on server
    if (wasDismissed && !dismissed) {
      dispatch(changeSetting(['dismissed_banners', id], true));
    }
  }, [id, dispatch, wasDismissed, dismissed]);

  return {
    wasDismissed,
    dismiss,
  };
}
