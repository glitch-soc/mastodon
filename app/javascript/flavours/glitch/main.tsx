import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Globals } from '@react-spring/web';

import * as perf from '@/flavours/glitch/utils/performance';
import { setupBrowserNotifications } from 'flavours/glitch/actions/notifications';
import Mastodon from 'flavours/glitch/containers/mastodon';
import { me, reduceMotion } from 'flavours/glitch/initial_state';
import ready from 'flavours/glitch/ready';
import { store } from 'flavours/glitch/store';

import { isDevelopment, isProduction } from './utils/environment';

function main() {
  perf.start('main()');

  return ready(async () => {
    const mountNode = document.getElementById('mastodon');
    if (!mountNode) {
      throw new Error('Mount node not found');
    }
    const props = JSON.parse(
      mountNode.getAttribute('data-props') ?? '{}',
    ) as Record<string, unknown>;

    if (reduceMotion) {
      Globals.assign({
        skipAnimation: true,
      });
    }

    const { initializeEmoji } = await import('./features/emoji/index');
    await initializeEmoji();

    const root = createRoot(mountNode);
    root.render(
      <StrictMode>
        <Mastodon {...props} />
      </StrictMode>,
    );
    store.dispatch(setupBrowserNotifications());

    if (
      me &&
      'serviceWorker' in navigator &&
      (isDevelopment() || isProduction()) // Disallow testing environment
    ) {
      let swPath = '/sw.js';
      if (isDevelopment()) {
        const { default: swDevUrl } =
          await import('@/flavours/glitch/service_worker/sw?url');
        swPath = swDevUrl;
      }

      await navigator.serviceWorker.register(swPath, {
        scope: '/',
        type: 'module',
      });

      if (isProduction()) {
        if ('Notification' in window && Notification.permission === 'granted') {
          const registerPushNotifications =
            await import('flavours/glitch/actions/push_notifications');

          store.dispatch(registerPushNotifications.register());
        }
      }
    }

    perf.stop('main()');
  });
}

// eslint-disable-next-line import/no-default-export
export default main;
