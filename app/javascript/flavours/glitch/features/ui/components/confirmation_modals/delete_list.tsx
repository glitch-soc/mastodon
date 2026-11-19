import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { useHistory } from 'react-router';

import { removeColumn } from 'flavours/glitch/actions/columns';
import { deleteList } from 'flavours/glitch/actions/lists';
import { useAppDispatch } from 'flavours/glitch/store';

import type { BaseConfirmationModalProps } from './confirmation_modal';
import { ConfirmationModal } from './confirmation_modal';

const messages = defineMessages({
  deleteTitle: {
    id: 'confirmations.delete_custom_feed.title',
    defaultMessage: 'Delete custom feed?',
  },
  deleteMessage: {
    id: 'confirmations.delete_custom_feed.message',
    defaultMessage:
      'Are you sure you want to permanently delete this custom feed?',
  },
  deleteConfirm: {
    id: 'confirmations.delete_list.confirm',
    defaultMessage: 'Delete',
  },
});

export const ConfirmDeleteListModal: React.FC<
  {
    listId: string;
    columnId: string;
  } & BaseConfirmationModalProps
> = ({ listId, columnId, onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const onConfirm = useCallback(() => {
    dispatch(deleteList(listId));

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      history.push('/lists');
    }
  }, [dispatch, history, columnId, listId]);

  return (
    <ConfirmationModal
      title={intl.formatMessage(messages.deleteTitle)}
      message={intl.formatMessage(messages.deleteMessage)}
      confirm={intl.formatMessage(messages.deleteConfirm)}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
};
