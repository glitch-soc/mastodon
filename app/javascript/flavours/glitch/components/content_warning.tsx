/* Significantly rewritten from upstream to keep the old design for now */

import { defineMessages, useIntl } from 'react-intl';

import ExpandLessIcon from '@/material-icons/400-24px/expand_less.svg?react';
import ExpandMoreIcon from '@/material-icons/400-24px/expand_more.svg?react';


import { Icon } from './icon';

// TODO: maybe use something better, to distinguish between CW and long post buttons?
const messages = defineMessages({
  show_less: { id: 'status.show_less', defaultMessage: 'Show less' },
  show_more: { id: 'status.show_more', defaultMessage: 'Show more' },
});

export const ContentWarning: React.FC<{
  text: string;
  expanded?: boolean;
  onClick?: () => void;
  icons?: React.ReactNode[];
}> = ({ text, expanded, onClick, icons }) => {
  const intl = useIntl();

  return (
    <button
      type='button'
      className='status__content__spoiler-link dropdown-button'
      onClick={onClick}
      aria-expanded={expanded}
    >
      <Icon
        id='content-spoiler-icon'
        className='status__content__spoiler-icon'
        title={
          expanded
            ? intl.formatMessage(messages.show_less)
            : intl.formatMessage(messages.show_more)
        }
        icon={expanded ? ExpandLessIcon : ExpandMoreIcon}
      />
      {icons && false}
      <span
        dangerouslySetInnerHTML={{ __html: text }}
        className='translate'
      />{' '}
    </button>
  );
};
