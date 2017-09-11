//  <NotificationOverlayContainer>
//  ==============================


//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/notification/overlay/container

//  * * * * * * *  //


//  Imports
//  -------

//  Package imports.
import { connect } from 'react-redux';

//  Mastodon imports.
import { markNotificationForDelete } from 'mastodon/actions/notifications';

//  Our imports.
import NotificationOverlay from './notification_overlay';

//  State mapping
//  -------------

const mapStateToProps = state => ({
  show: state.getIn(['notifications', 'cleaningMode']),
});

//  Dispatch mapping
//  ----------------

const mapDispatchToProps = dispatch => ({
  onMarkForDelete(id, yes) {
    dispatch(markNotificationForDelete(id, yes));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NotificationOverlay);
