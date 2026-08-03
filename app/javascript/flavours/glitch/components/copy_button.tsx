import { useState, useCallback } from 'react';

import { defineMessages } from 'react-intl';

import classNames from 'classnames';

import ContentCopyIcon from '@/material-icons/400-24px/content_copy.svg?react';
import { showAlert } from 'flavours/glitch/actions/alerts';
import { IconButton } from 'flavours/glitch/components/icon_button';
import { useAppDispatch } from 'flavours/glitch/store';

import { Button } from './button';

const messages = defineMessages({
  copied: {
    id: 'copy_icon_button.copied',
    defaultMessage: 'Copied to clipboard',
  },
});

export function useCopyToClipboard({ text }: { text: string }) {
  const [wasCopied, setWasCopied] = useState(false);
  const dispatch = useAppDispatch();

  const copyText = useCallback(() => {
    void navigator.clipboard.writeText(text);
    setWasCopied(true);
    dispatch(showAlert({ message: messages.copied }));
    setTimeout(() => {
      setWasCopied(false);
    }, 700);
  }, [setWasCopied, text, dispatch]);

  return { copyText, wasCopied };
}

export const CopyButton: React.FC<
  Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    'onClick' | 'text' | 'children'
  > & {
    value: string;
    children: React.ReactNode | ((wasCopied: boolean) => React.ReactNode);
  }
> = ({ value, children, ...otherProps }) => {
  const { copyText, wasCopied } = useCopyToClipboard({ text: value });

  const label = typeof children === 'function' ? children(wasCopied) : children;

  return (
    <Button {...otherProps} onClick={copyText}>
      {label}
    </Button>
  );
};

export const CopyIconButton: React.FC<{
  title: string;
  value: string;
  className?: string;
  'aria-describedby'?: string;
}> = ({ title, value, className, 'aria-describedby': ariaDescribedBy }) => {
  const { copyText, wasCopied } = useCopyToClipboard({ text: value });

  return (
    <IconButton
      className={classNames(className, wasCopied ? 'copied' : 'copyable')}
      title={title}
      onClick={copyText}
      icon='copy-icon'
      iconComponent={ContentCopyIcon}
      aria-describedby={ariaDescribedBy}
    />
  );
};
