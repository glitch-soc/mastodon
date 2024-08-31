import { useCallback } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import classNames from 'classnames';

import StarIcon from '@/material-icons/400-24px/star.svg?react';
import { Button } from 'flavours/glitch/components/button';
import { Icon } from 'flavours/glitch/components/icon';
import { EmbeddedStatus } from 'flavours/glitch/features/notifications_v2/components/embedded_status';
import type { Status } from 'flavours/glitch/models/status';

const messages = defineMessages({
  favourite: { id: 'status.favourite', defaultMessage: 'Favorite' },
});

export const FavouriteModal: React.FC<{
  status: Status;
  onClose: () => void;
  onFavourite: (status: Status) => void;
}> = ({ status, onFavourite, onClose }) => {
  const intl = useIntl();

  const statusId = status.get('id') as string;

  const handleFavourite = useCallback(() => {
    onFavourite(status);
    onClose();
  }, [onClose, onFavourite, status]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className='modal-root__modal safety-action-modal'>
      <div className='safety-action-modal__top'>
        <div className='safety-action-modal__header'>
          <div className='safety-action-modal__header__icon'>
            <Icon icon={StarIcon} id='star' />
          </div>

          <div>
            <h1>
              <FormattedMessage
                id='favourite_modal.favourite'
                defaultMessage='Favourite post?'
              />
            </h1>
            <div>
              <FormattedMessage
                id='boost_modal.combo'
                defaultMessage='You can press {combo} to skip this next time'
                values={{
                  combo: (
                    <span className='hotkey-combination'>
                      <kbd>Shift</kbd>+<Icon id='star' icon={StarIcon} />
                    </span>
                  ),
                }}
              />
            </div>
          </div>
        </div>

        <div className='safety-action-modal__status'>
          <EmbeddedStatus statusId={statusId} />
        </div>
      </div>

      <div className={classNames('safety-action-modal__bottom')}>
        <div className='safety-action-modal__actions'>
          <div className='spacer' />

          <button onClick={handleCancel} className='link-button'>
            <FormattedMessage
              id='confirmation_modal.cancel'
              defaultMessage='Cancel'
            />
          </button>

          <Button
            onClick={handleFavourite}
            text={intl.formatMessage(messages.favourite)}
          />
        </div>
      </div>
    </div>
  );
};
