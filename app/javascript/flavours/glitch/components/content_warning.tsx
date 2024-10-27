import { StatusBanner, BannerVariant } from './status_banner';

export const ContentWarning: React.FC<{
  text: string;
  expanded?: boolean;
  onClick?: () => void;
  icons?: React.ReactNode[];
}> = ({ text, expanded, onClick, icons }) => (
  <StatusBanner
    expanded={expanded}
    onClick={onClick}
    variant={BannerVariant.Warning}
  >
    {icons}
    <p dangerouslySetInnerHTML={{ __html: text }} />
  </StatusBanner>
);
