import { useStatus } from '../hooks/useStatus';

import { EmojiHTML } from './emoji/html';
import type { IconName } from './media_icon';
import { MediaIcon } from './media_icon';
import { StatusBanner, BannerVariant } from './status_banner';

export const ContentWarning: React.FC<{
  statusId: string;
  expanded?: boolean;
  onClick?: () => void;
  icons?: IconName[];
}> = ({ statusId, expanded, onClick, icons }) => {
  const status = useStatus(statusId);
  const hasSpoiler = !!status?.spoiler_text;
  const text = status?.translation?.spoilerHtml ?? status?.spoilerHtml;
  if (!hasSpoiler || !text) {
    return null;
  }

  return (
    <StatusBanner
      expanded={expanded}
      onClick={onClick}
      variant={BannerVariant.Warning}
    >
      {icons?.map((icon) => (
        <MediaIcon
          className='status__content__spoiler-icon'
          icon={icon}
          key={`icon-${icon}`}
        />
      ))}
      <EmojiHTML as='span' htmlString={text} extraEmojis={status.emojis} />
    </StatusBanner>
  );
};
