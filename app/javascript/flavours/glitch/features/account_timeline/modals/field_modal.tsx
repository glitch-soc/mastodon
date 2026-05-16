import type { FC } from 'react';

import { FormattedMessage } from 'react-intl';

import type { AccountField } from '@/flavours/glitch/components/account_header/fields';
import { Button } from '@/flavours/glitch/components/button';
import { EmojiHTML } from '@/flavours/glitch/components/emoji/html';
import {
  ModalShell,
  ModalShellActions,
  ModalShellBody,
} from '@/flavours/glitch/components/modal_shell';

import { useFieldHtml } from '../hooks/useFieldHtml';

import classes from './styles.module.scss';

export const AccountFieldModal: FC<{
  onClose: () => void;
  field: AccountField;
}> = ({ onClose, field }) => {
  const handleLabelElement = useFieldHtml(field.nameHasEmojis);
  const handleValueElement = useFieldHtml(field.valueHasEmojis);
  return (
    <ModalShell>
      <ModalShellBody>
        <EmojiHTML
          as='h2'
          htmlString={field.name_emojified}
          onElement={handleLabelElement}
          className={classes.fieldName}
        />
        <EmojiHTML
          as='p'
          htmlString={field.value_emojified}
          onElement={handleValueElement}
          className={classes.fieldValue}
        />
      </ModalShellBody>
      <ModalShellActions>
        <Button onClick={onClose} plain>
          <FormattedMessage id='lightbox.close' defaultMessage='Close' />
        </Button>
      </ModalShellActions>
    </ModalShell>
  );
};
