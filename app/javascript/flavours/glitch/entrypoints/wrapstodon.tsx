import { createRoot } from 'react-dom/client';

import { Provider as ReduxProvider } from 'react-redux';

import { importFetchedStatuses } from '@/flavours/glitch/actions/importer';
import { hydrateStore } from '@/flavours/glitch/actions/store';
import type { ApiAnnualReportResponse } from '@/flavours/glitch/api/annual_report';
import { FocusTargetProvider } from '@/flavours/glitch/components/navigation_focus_target';
import { Router } from '@/flavours/glitch/components/router';
import { WrapstodonSharedPage } from '@/flavours/glitch/features/annual_report/shared_page';
import { IntlProvider, loadLocale } from '@/flavours/glitch/locales';
import { loadPolyfills } from '@/flavours/glitch/polyfills';
import ready from '@/flavours/glitch/ready';
import { setReport } from '@/flavours/glitch/reducers/slices/annual_report';
import { store } from '@/flavours/glitch/store';

function loaded() {
  const mountNode = document.getElementById('wrapstodon');
  if (!mountNode) {
    throw new Error('Mount node not found');
  }
  const propsNode = document.getElementById('wrapstodon-data');
  if (!propsNode) {
    throw new Error('Initial state prop not found');
  }

  const initialState = JSON.parse(
    propsNode.textContent,
  ) as ApiAnnualReportResponse & { me?: string; domain: string };

  const report = initialState.annual_reports[0];
  if (!report) {
    throw new Error('Initial state report not found');
  }

  // Set up store
  store.dispatch(
    hydrateStore({
      meta: {
        locale: document.documentElement.lang,
        me: initialState.me,
        domain: initialState.domain,
      },
      accounts: initialState.accounts,
    }),
  );
  store.dispatch(importFetchedStatuses(initialState.statuses));

  store.dispatch(setReport(report));

  const root = createRoot(mountNode);
  root.render(
    <IntlProvider>
      <ReduxProvider store={store}>
        <Router>
          <FocusTargetProvider>
            <WrapstodonSharedPage />
          </FocusTargetProvider>
        </Router>
      </ReduxProvider>
    </IntlProvider>,
  );
}

loadPolyfills()
  .then(loadLocale)
  .then(() => ready(loaded))
  .catch((err: unknown) => {
    console.error(err);
  });
