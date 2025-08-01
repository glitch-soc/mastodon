import { createRoot } from 'react-dom/client';

import { Globals } from '@react-spring/web';

import * as perf from '@/flavours/glitch/utils/performance';
import { setupBrowserNotifications } from 'flavours/glitch/actions/notifications';
import Mastodon from 'flavours/glitch/containers/mastodon';
import { me, reduceMotion } from 'flavours/glitch/initial_state';
import ready from 'flavours/glitch/ready';
import { store } from 'flavours/glitch/store';

import {
  isProduction,
  isDevelopment,
  isModernEmojiEnabled,
} from './utils/environment';

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

    if (isModernEmojiEnabled()) {
      const { initializeEmoji } = await import(
        '@/flavours/glitch/features/emoji'
      );
      initializeEmoji();
    }

    const root = createRoot(mountNode);
    root.render(<Mastodon {...props} />);
    store.dispatch(setupBrowserNotifications());

    if (isProduction() && me && 'serviceWorker' in navigator) {
      const { Workbox } = await import('workbox-window');
      const wb = new Workbox(
        isDevelopment() ? '/packs-dev/dev-sw.js?dev-sw' : '/sw.js',
        { type: 'module', scope: '/' },
      );
      let registration;

      try {
        registration = await wb.register();
      } catch (err) {
        console.error(err);
      }

      if (
        registration &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const registerPushNotifications = await import(
          'flavours/glitch/actions/push_notifications'
        );

        store.dispatch(registerPushNotifications.register());
      }
    }

    perf.stop('main()');
  });
}

// eslint-disable-next-line import/no-default-export
export default main;
