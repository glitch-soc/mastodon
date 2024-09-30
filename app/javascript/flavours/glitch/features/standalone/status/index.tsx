/* eslint-disable @typescript-eslint/no-unsafe-return,
                  @typescript-eslint/no-explicit-any,
                  @typescript-eslint/no-unsafe-assignment */

import { useEffect, useCallback } from 'react';

import { Provider } from 'react-redux';

import {
  fetchStatus,
  toggleStatusSpoilers,
} from 'flavours/glitch/actions/statuses';
import { hydrateStore } from 'flavours/glitch/actions/store';
import { Router } from 'flavours/glitch/components/router';
import { DetailedStatus } from 'flavours/glitch/features/status/components/detailed_status';
import { useRenderSignal } from 'flavours/glitch/hooks/useRenderSignal';
import initialState from 'flavours/glitch/initial_state';
import { IntlProvider } from 'flavours/glitch/locales';
import {
  makeGetStatus,
  makeGetPictureInPicture,
} from 'flavours/glitch/selectors';
import { store, useAppSelector, useAppDispatch } from 'flavours/glitch/store';

const getStatus = makeGetStatus() as unknown as (arg0: any, arg1: any) => any;
const getPictureInPicture = makeGetPictureInPicture() as unknown as (
  arg0: any,
  arg1: any,
) => any;

const Embed: React.FC<{ id: string }> = ({ id }) => {
  const status = useAppSelector((state) => getStatus(state, { id }));
  const pictureInPicture = useAppSelector((state) =>
    getPictureInPicture(state, { id }),
  );
  const domain = useAppSelector((state) => state.meta.get('domain'));
  const dispatch = useAppDispatch();
  const dispatchRenderSignal = useRenderSignal();

  useEffect(() => {
    dispatch(fetchStatus(id, false, false));
  }, [dispatch, id]);

  const handleToggleHidden = useCallback(() => {
    dispatch(toggleStatusSpoilers(id));
  }, [dispatch, id]);

  // This allows us to calculate the correct page height for embeds
  if (status) {
    dispatchRenderSignal();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const permalink = status?.get('url') as string;

  return (
    <div className='embed'>
      <DetailedStatus
        status={status}
        domain={domain}
        pictureInPicture={pictureInPicture}
        onToggleHidden={handleToggleHidden}
        expanded={false}
        withLogo
      />

      <a
        className='embed__overlay'
        href={permalink}
        target='_blank'
        rel='noreferrer noopener'
        aria-label=''
      />
    </div>
  );
};

export const Status: React.FC<{ id: string }> = ({ id }) => {
  useEffect(() => {
    if (initialState) {
      store.dispatch(hydrateStore(initialState));
    }
  }, []);

  return (
    <IntlProvider>
      <Provider store={store}>
        <Router>
          <Embed id={id} />
        </Router>
      </Provider>
    </IntlProvider>
  );
};
