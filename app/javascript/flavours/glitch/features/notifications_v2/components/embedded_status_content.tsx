import { useCallback, useMemo } from 'react';

import type { List, Map } from 'immutable';

import { EmojiHTML } from '@/flavours/glitch/components/emoji/html';
import { useElementHandledLink } from '@/flavours/glitch/components/status/handled_link';
import type { CustomEmoji } from '@/flavours/glitch/models/custom_emoji';
import type { Status } from '@/flavours/glitch/models/status';

import type { Mention } from './embedded_status';

export const EmbeddedStatusContent: React.FC<{
  status: Status;
  className?: string;
}> = ({ status, className }) => {
  const mentions = useMemo(
    () => (status.get('mentions') as List<Mention>).toJS(),
    [status],
  );
  const hrefToMention = useCallback(
    (href: string) => {
      return mentions.find((item) => item.url === href);
    },
    [mentions],
  );
  const hrefToCollection = useCallback(
    (href: string) => {
      const collections = status.get('tagged_collections') as List<
        Map<'url' | 'id', string>
      >;
      const collection = collections.find((item) => item.get('url') === href);
      return collection?.get('id');
    },
    [status],
  );
  const htmlHandlers = useElementHandledLink({
    hashtagAccountId: status.get('account') as string | undefined,
    hrefToCollectionId: hrefToCollection,
    hrefToMention,
  });

  return (
    <EmojiHTML
      {...htmlHandlers}
      className={className}
      lang={status.get('language') as string}
      htmlString={status.get('contentHtml') as string}
      extraEmojis={status.get('emojis') as List<CustomEmoji>}
    />
  );
};
