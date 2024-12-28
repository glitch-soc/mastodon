import type { IconName } from './media_icon';
import { MediaIcon } from './media_icon';
import { StatusBanner, BannerVariant } from './status_banner';

export const ContentWarning: React.FC<{
  text: string;
  expanded?: boolean;
  onClick?: () => void;
  icons?: IconName[];
}> = ({ text, expanded, onClick, icons }) => (
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
    <p dangerouslySetInnerHTML={{ __html: text }} />
  </StatusBanner>
);
