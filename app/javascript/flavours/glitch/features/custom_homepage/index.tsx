import { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { SignInIcon } from '@phosphor-icons/react';
import { Helmet } from '@unhead/react/helmet';

import {
  ColumnHeader,
  ColumnHeaderButton,
} from '@/flavours/glitch/components/column_header';
import { NavigationFocusTarget } from '@/flavours/glitch/components/navigation_focus_target';
import { useIdentity } from '@/flavours/glitch/identity_context';
import { domain, sso_redirect } from '@/flavours/glitch/initial_state';
import { fetchServer } from 'flavours/glitch/actions/server';
import { ServerHeroImage } from 'flavours/glitch/components/server_hero_image';
import { TabLink, TabList } from 'flavours/glitch/components/tab_list';
import { useAppSelector, useAppDispatch } from 'flavours/glitch/store';

import { About } from './about';
import { LatestActivity } from './latest_activity';
import classes from './styles.module.scss';

export const CustomHomepage: React.FC = () => {
  const dispatch = useAppDispatch();
  const server = useAppSelector((state) => state.server.server);
  const { signedIn } = useIdentity();
  const { path } = useRouteMatch();

  useEffect(() => {
    void dispatch(fetchServer());
  }, [dispatch]);

  return (
    <div className={classNames(classes.page, classes.pageRedesign)}>
      <ColumnHeader
        title={domain}
        extraButtons={
          !signedIn && (
            <ColumnHeaderButton
              as='a'
              href={sso_redirect ?? '/auth/sign_in'}
              data-method={sso_redirect ? 'post' : undefined}
              showTextOnDesktop
              icon={SignInIcon}
              variant='solid'
              color='accent'
            >
              <FormattedMessage
                id='sign_in_banner.sign_in'
                defaultMessage='Login'
              />
            </ColumnHeaderButton>
          )
        }
      />
      <ServerHeroImage
        alt={server.item?.thumbnail.description ?? ''}
        blurhash={server.item?.thumbnail.blurhash ?? ''}
        src={server.item?.thumbnail.url ?? ''}
        srcSet={Object.keys(server.item?.thumbnail.versions ?? {})
          .map(
            (key) =>
              `${server.item?.thumbnail.versions?.[key]} ${key.replace('@', '')}`,
          )
          .join(', ')}
        className={classes.header}
      />

      <div className={classes.topSection}>
        <NavigationFocusTarget as='h1'>
          {server.item?.domain}
        </NavigationFocusTarget>
        <p>{server.item?.description}</p>
      </div>

      <TabList>
        <TabLink to={path} exact>
          <FormattedMessage
            id='custom_homepage.latest_activity'
            defaultMessage='Latest activity'
          />
        </TabLink>

        <TabLink to={`${path}/about`} exact>
          <FormattedMessage id='custom_homepage.about' defaultMessage='About' />
        </TabLink>
      </TabList>

      <Switch>
        <Route path={path} exact component={LatestActivity} />
        <Route path={`${path}/about`} exact component={About} />
      </Switch>

      <Helmet>
        <title>{server.item?.domain}</title>
        <meta name='robots' content='all' />
      </Helmet>
    </div>
  );
};
