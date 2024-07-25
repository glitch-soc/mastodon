import Notifications from 'flavours/glitch/features/notifications';
import Notifications_v2 from 'flavours/glitch/features/notifications_v2';
import { useAppSelector } from 'flavours/glitch/store';

export const NotificationsWrapper = (props) => {
  const optedInGroupedNotifications = useAppSelector((state) => state.getIn(['settings', 'notifications', 'groupingBeta'], false));

  return (
    optedInGroupedNotifications ? <Notifications_v2 {...props} /> : <Notifications {...props} />
  );
};

export default NotificationsWrapper;