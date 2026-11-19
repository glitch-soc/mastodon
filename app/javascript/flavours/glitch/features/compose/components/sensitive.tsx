import { useCallback, useRef } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { EyeSlashIcon, PlusIcon } from '@phosphor-icons/react';

import { changeComposeSpoilerText } from '@/flavours/glitch/actions/compose';
import { TextInput } from '@/flavours/glitch/components/form_fields';
import { normalizeKey } from '@/flavours/glitch/components/hotkeys/utils';
import { Icon } from '@/flavours/glitch/components/icon';
import { useToggle } from '@/flavours/glitch/hooks/useToggle';
import {
  clearComposerErrors,
  requestComposerFocus,
} from '@/flavours/glitch/reducers/slices/composer';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';
import { isKeyComposing } from '@/flavours/glitch/utils/events';

import classes from '../styles.module.scss';

import { selectComposeSensitive } from './selectors';

const messages = defineMessages({
  placeholder: {
    id: 'compose.sensitive.placeholder',
    defaultMessage: 'Add content warning…',
  },
  sensitiveMissing: {
    id: 'form_error.blank',
    defaultMessage: 'Field cannot be blank.',
  },
});

export const ComposeSensitiveField: React.FC<
  React.ComponentPropsWithoutRef<'input'>
> = (props) => {
  const { sensitive, sensitiveText } = useAppSelector(selectComposeSensitive);

  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      dispatch(changeComposeSpoilerText(event.target.value));
      if (event.target.value) {
        dispatch(clearComposerErrors(['empty']));
      }
    },
    [dispatch],
  );
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (isKeyComposing(event)) {
        return;
      }

      const key = normalizeKey(event.key);
      if (key === 'enter') {
        event.preventDefault();
        dispatch(requestComposerFocus());
        return false;
      } else if (key === 'escape') {
        event.preventDefault();
        inputRef.current?.blur();
        return false;
      }
      return;
    },
    [dispatch],
  );

  const onWrapperClick: React.MouseEventHandler = useCallback((event) => {
    if (event.target instanceof HTMLInputElement) {
      return;
    }
    inputRef.current?.focus();
  }, []);

  const [focused, { onTrue: onFocus, onFalse: onBlur }] = useToggle();

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={classes.sensitiveWrapper}
      data-contents={!!sensitiveText}
      onClick={onWrapperClick}
    >
      <Icon icon={focused || sensitive ? EyeSlashIcon : PlusIcon} />
      <TextInput
        {...props}
        autoFocus
        ref={inputRef}
        aria-required='true'
        value={sensitiveText}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={classes.sensitive}
        placeholder={intl.formatMessage(messages.placeholder)}
      />
    </div>
  );
};
