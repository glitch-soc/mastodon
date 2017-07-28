/*

`<NotificationPurgeButtonsContainer>`
=========================

This container connects `<NotificationPurgeButtons>`s to the Redux store.

*/

//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

/*

Imports:
--------

*/

//  Package imports  //
import { connect } from 'react-redux';

//  Our imports  //
import NotificationPurgeButtons from './notification_purge_buttons';
import {
  deleteMarkedNotifications,
  enterNotificationClearingMode,
  markAllNotifications,
} from '../../../../mastodon/actions/notifications';

//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

/*

Dispatch mapping:
-----------------

The `mapDispatchToProps()` function maps dispatches to our store to the
various props of our component. We only need to provide a dispatch for
deleting notifications.

*/

const mapDispatchToProps = dispatch => ({
  onEnterCleaningMode(yes) {
    dispatch(enterNotificationClearingMode(yes));
  },

  onDeleteMarked() {
    dispatch(deleteMarkedNotifications());
  },

  onMarkAll() {
    dispatch(markAllNotifications(true));
  },

  onMarkNone() {
    dispatch(markAllNotifications(false));
  },

  onInvert() {
    dispatch(markAllNotifications(null));
  },
});

const mapStateToProps = state => ({
  markNewForDelete: state.getIn(['notifications', 'markNewForDelete']),
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationPurgeButtons);
