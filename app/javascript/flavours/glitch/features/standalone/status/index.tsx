import { useEffect } from 'react';

import { Provider } from 'react-redux';

import { hydrateStore } from '@/flavours/glitch/actions/store';
import { Icon } from '@/flavours/glitch/components/icon';
import { IconLogo } from '@/flavours/glitch/components/logo';
import { FocusTargetProvider } from '@/flavours/glitch/components/navigation_focus_target';
import { Router } from '@/flavours/glitch/components/router';
import { Status } from '@/flavours/glitch/components/status';
import { useRenderSignal } from '@/flavours/glitch/hooks/useRenderSignal';
import { useExpandedStatus } from '@/flavours/glitch/hooks/useStatus';
import { initialState } from '@/flavours/glitch/initial_state';
import { IntlProvider } from '@/flavours/glitch/locales';
import { store } from '@/flavours/glitch/store';

import classes from './styles.module.scss';

const Embed: React.FC<{ id: string }> = ({ id }) => {
  const status = useExpandedStatus(id, true);
  const dispatchRenderSignal = useRenderSignal();

  // This allows us to calculate the correct page height for embeds
  if (status) {
    dispatchRenderSignal();
  }

  return (
    <div className={classes.root}>
      <Status id={status?.id} variant='page' />

      {status?.url && (
        <a
          className={classes.overlay}
          href={status.url}
          target='_blank'
          rel='noopener'
          aria-label=''
        />
      )}

      <Icon icon={IconLogo} className={classes.logo} />
    </div>
  );
};

export const EmbedRoot: React.FC<{ id: string }> = ({ id }) => {
  useEffect(() => {
    if (initialState) {
      store.dispatch(hydrateStore(initialState));
    }
  }, []);

  return (
    <IntlProvider>
      <Provider store={store}>
        <Router>
          <FocusTargetProvider>
            <Embed id={id} />
          </FocusTargetProvider>
        </Router>
      </Provider>
    </IntlProvider>
  );
};
