import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { PenNibIcon } from '@phosphor-icons/react';

import { closeNavigation } from '@/flavours/glitch/actions/navigation';
import { Button } from '@/flavours/glitch/components/button';
import { IconLogo } from '@/flavours/glitch/components/logo';
import { useIdentity } from '@/flavours/glitch/identity_context';
import { customAppIcon, domain, title } from '@/flavours/glitch/initial_state';
import { openNewComposer } from '@/flavours/glitch/reducers/slices/composer';
import { useAppDispatch } from '@/flavours/glitch/store';

import { getNavigationSkipLinkId } from '../ui/components/skip_links';

import classes from './header.module.scss';
import { MiniNav } from './mini_nav';

export const NavigationHeader: React.FC<{
  siteName?: string;
  isStuck: boolean;
}> = ({ siteName, isStuck }) => {
  const { signedIn } = useIdentity();
  const dispatch = useAppDispatch();

  const openComposer = useCallback(() => {
    dispatch(closeNavigation());
    dispatch(openNewComposer({ type: 'post' }));
  }, [dispatch]);

  return (
    <header className={classes.root} data-stuck={isStuck}>
      <LogoLockup siteName={siteName} />

      {signedIn && (
        <>
          <MiniNav />

          <Button
            leadingIcon={PenNibIcon}
            onClick={openComposer}
            variant='solid'
            color='accent'
            size='md'
            className={classes.newPostButton}
          >
            <FormattedMessage id='tabs_bar.publish' defaultMessage='New Post' />
          </Button>
        </>
      )}
    </header>
  );
};

export const LogoLockup: React.FC<{
  siteName?: string;
  className?: string;
}> = ({ siteName, className }) => {
  return (
    <Link
      to='/'
      className={classNames(classes.lockupLink, className)}
      id={getNavigationSkipLinkId()}
    >
      {customAppIcon && (
        <img src={customAppIcon} alt='' className={classes.lockupIcon} />
      )}
      <span className={classes.lockupContent}>
        <span className={classes.lockupName}>
          {siteName ?? title ?? domain}
        </span>
        <span className={classes.lockupPoweredBy}>
          <FormattedMessage
            id='navigation_bar.powered_by_mastodon'
            defaultMessage='powered by {logo}Mastodon'
            values={{
              logo: <IconLogo role='presentation' />,
            }}
          />
        </span>
      </span>
    </Link>
  );
};
