import { FormattedMessage } from 'react-intl';

import { LinkIcon } from '@phosphor-icons/react';

import { Icon } from '@/flavours/glitch/components/icon';
import type { MediaAttachmentShape } from '@/flavours/glitch/models/status';
import { fileName } from '@/flavours/glitch/utils/strings';

export const ConversationAttachments: React.FC<{
  media: MediaAttachmentShape[];
}> = ({ media }) => {
  return (
    <div className='attachment-list compact'>
      <ul className='attachment-list__list'>
        {media.map((attachment) => {
          const displayUrl = attachment.remote_url ?? attachment.url;
          return (
            <li key={attachment.id}>
              <a href={displayUrl} target='_blank' rel='noopener'>
                <Icon id='link' icon={LinkIcon} />
                {displayUrl ? (
                  fileName(displayUrl)
                ) : (
                  <FormattedMessage
                    id='attachments_list.unprocessed'
                    defaultMessage='(unprocessed)'
                  />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
