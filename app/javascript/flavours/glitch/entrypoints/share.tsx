import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';

import { fetchServer } from '@/flavours/glitch/actions/server';
import { hydrateStore } from '@/flavours/glitch/actions/store';
import { Router } from '@/flavours/glitch/components/router';
import { initializeEmoji } from '@/flavours/glitch/features/emoji';
import { Compose } from '@/flavours/glitch/features/standalone/compose';
import { initialState } from '@/flavours/glitch/initial_state';
import { IntlProvider } from '@/flavours/glitch/locales';
import { loadPolyfills } from '@/flavours/glitch/polyfills';
import ready from '@/flavours/glitch/ready';
import { requestComposerFocus } from '@/flavours/glitch/reducers/slices/composer';
import { store } from '@/flavours/glitch/store';

async function loaded() {
  const mountNode = document.getElementById('mastodon-compose');

  if (!mountNode) {
    return;
  }

  if (initialState) {
    store.dispatch(hydrateStore(initialState));
  }

  await store.dispatch(fetchServer());
  await initializeEmoji();

  // Put the caret at the end on load.
  const caretPosition = initialState?.compose.text.length;
  if (caretPosition) {
    store.dispatch(
      requestComposerFocus({ start: caretPosition, end: caretPosition }),
    );
  }

  const root = createRoot(mountNode);

  root.render(
    <IntlProvider>
      <Provider store={store}>
        <Router>
          <Compose />
        </Router>
      </Provider>
    </IntlProvider>,
  );
}

function main() {
  ready(loaded).catch((error: unknown) => {
    console.error(error);
  });
}

loadPolyfills()
  .then(main)
  .catch((error: unknown) => {
    console.error(error);
  });
