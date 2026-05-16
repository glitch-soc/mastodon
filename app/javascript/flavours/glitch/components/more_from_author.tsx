import { FormattedMessage } from 'react-intl';

import { IconLogo } from 'flavours/glitch/components/logo';
import { AuthorLink } from 'flavours/glitch/features/explore/components/author_link';

export const MoreFromAuthor: React.FC<{ accountId: string }> = ({
  accountId,
}) => (
  <div className='more-from-author'>
    <IconLogo />
    <FormattedMessage
      id='link_preview.more_from_author'
      defaultMessage='More from {name}'
      values={{ name: <AuthorLink accountId={accountId} /> }}
    />
  </div>
);
