// This file replaces `app/javascript/packs/application.js` for use
// with multiple frontends.

import loadPolyfills from '../../mastodon/load_polyfills';

loadPolyfills().then(() => {
  require('../../mastodon/main').default();
}).catch(e => {
  console.error(e);
});
