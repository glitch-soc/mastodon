import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import { closeModal } from '@/flavours/glitch/actions/modal';
import { Button } from '@/flavours/glitch/components/button';
import {
  ModalActions,
  ModalShell,
  ModalTitle,
} from '@/flavours/glitch/components/modal_shell/redesign';
import { useAppDispatch } from '@/flavours/glitch/store';

import NotificationSettings from '../../notifications/containers/column_settings_container';

const NotificationSettingsModal: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleCloseModal = useCallback(() => {
    void dispatch(
      closeModal({ modalType: 'NOTIFICATION_SETTINGS', ignoreFocus: false }),
    );
  }, [dispatch]);

  return (
    <ModalShell>
      <ModalTitle onClose={handleCloseModal}>
        <FormattedMessage
          id='notifications.settings'
          defaultMessage='Notification Settings'
        />
      </ModalTitle>
      <NotificationSettings />
      <ModalActions>
        <Button variant='solid' color='accent' onClick={handleCloseModal}>
          <FormattedMessage id='alt_text_modal.done' defaultMessage='Done' />
        </Button>
      </ModalActions>
    </ModalShell>
  );
};

export default NotificationSettingsModal;
