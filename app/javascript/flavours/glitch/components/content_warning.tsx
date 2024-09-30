/* Significantly rewritten from upstream to keep the old design for now */

import { FormattedMessage } from 'react-intl';

export const ContentWarning: React.FC<{
  text: string;
  expanded?: boolean;
  onClick?: () => void;
  icons?: React.ReactNode[];
}> = ({ text, expanded, onClick, icons }) => (
  <p>
    <span dangerouslySetInnerHTML={{ __html: text }} className='translate' />{' '}
    <button
      type='button'
      className='status__content__spoiler-link'
      onClick={onClick}
      aria-expanded={expanded}
    >
      {expanded ? (
        <FormattedMessage id='status.show_less' defaultMessage='Show less' />
      ) : (
        <FormattedMessage id='status.show_more' defaultMessage='Show more' />
      )}
      {icons}
    </button>
  </p>
);
