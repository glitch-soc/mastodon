import Notifications from 'flavours/glitch/features/notifications';
import Notifications_v2 from 'flavours/glitch/features/notifications_v2';
import { selectUseGroupedNotifications } from 'flavours/glitch/selectors/settings';
import { useAppSelector } from 'flavours/glitch/store';

export const NotificationsWrapper = (props) => {
  const optedInGroupedNotifications = useAppSelector(selectUseGroupedNotifications);

  return (
    optedInGroupedNotifications ? <Notifications_v2 {...props} /> : <Notifications {...props} />
  );
};

export default NotificationsWrapper;