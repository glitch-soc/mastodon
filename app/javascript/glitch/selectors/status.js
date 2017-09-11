import { createSelector } from 'reselect';

const makeStatusSelector = () => {
  return createSelector(
    [
      (state, id) => state.getIn(['statuses', id]),
      (state, id) => state.getIn(['statuses', state.getIn(['statuses', id, 'reblog'])]),
      (state, id) => state.getIn(['accounts', state.getIn(['statuses', id, 'account'])]),
      (state, id) => state.getIn(['accounts', state.getIn(['statuses', state.getIn(['statuses', id, 'reblog']), 'account'])]),
      (state, id) => state.getIn(['cards', id], null),
    ],

    (statusBase, statusReblog, accountBase, accountReblog, card) => {
      if (!statusBase) {
        return null;
      }

      if (statusReblog) {
        statusReblog = statusReblog.set('account', accountReblog);
      } else {
        statusReblog = null;
      }

      return statusBase.withMutations(map => {
        map.set('reblog', statusReblog);
        map.set('account', accountBase);
        map.set('card', card);
      });
    }
  );
};

export default makeStatusSelector;
