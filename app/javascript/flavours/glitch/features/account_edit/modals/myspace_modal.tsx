import { useCallback, useId, useState } from 'react';
import type { ChangeEventHandler, FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { TextAreaField } from '@/flavours/glitch/components/form_fields';
import type { TextAreaProps } from '@/flavours/glitch/components/form_fields/text_area_field';
import type { BaseConfirmationModalProps } from '@/flavours/glitch/features/ui/components/confirmation_modals';
import { ConfirmationModal } from '@/flavours/glitch/features/ui/components/confirmation_modals';
import { patchProfile } from '@/flavours/glitch/reducers/slices/profile_edit';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';

import classes from './styles.module.scss';

const messages = defineMessages({
  editTitle: {
    id: 'account_edit.myspace.edit_label',
    defaultMessage: 'Edit CSS',
  },
  save: {
    id: 'account_edit.save',
    defaultMessage: 'Save',
  },
});

export const MyspaceModal: FC<BaseConfirmationModalProps> = ({ onClose }) => {
  const intl = useIntl();
  const titleId = useId();

  const { profile: { accountCss } = {}, isPending } = useAppSelector(
    (state) => state.profileEdit,
  );
  const [newCSS, setNewCSS] = useState(accountCss ?? '');

  const dispatch = useAppDispatch();
  const handleSave = useCallback(() => {
    if (!isPending) {
      void dispatch(patchProfile({ account_css: newCSS })).then(onClose);
    }
  }, [dispatch, isPending, newCSS, onClose]);

  // TypeScript isn't correctly picking up minRows when on the element directly.
  const textAreaProps = {
    autoSize: true,
    minRows: 3,
  } as const satisfies TextAreaProps;

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      setNewCSS(event.target.value);
    },
    [setNewCSS],
  );

  return (
    <ConfirmationModal
      title={intl.formatMessage(messages.editTitle)}
      titleId={titleId}
      confirm={intl.formatMessage(messages.save)}
      onConfirm={handleSave}
      onClose={onClose}
      updating={isPending}
      noFocusButton
    >
      <TextAreaField
        id={'account_account_css'}
        label=''
        value={newCSS}
        onChange={onChange}
        aria-labelledby={titleId}
        className={classes.bioField}
        {...textAreaProps}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- This is a modal, it's fine.
        autoFocus
      />
    </ConfirmationModal>
  );
};
