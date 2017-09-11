import { createStructuredSelector } from 'reselect';

const makeIntlSelector = () => createStructuredSelector({
  intl: ({ intl }) => intl,
});

export default makeIntlSelector;
