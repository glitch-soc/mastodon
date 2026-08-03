import { defineMessages, useIntl } from 'react-intl';

import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { Helmet } from '@unhead/react/helmet';

import { NavigationFocusTarget } from '@/flavours/glitch/components/navigation_focus_target';
import { Column } from 'flavours/glitch/components/column';
import { ColumnHeader } from 'flavours/glitch/components/column_header';
import { DisplayNameSimple } from 'flavours/glitch/components/display_name/simple';
import { Scrollable } from 'flavours/glitch/components/scrollable_list/components';
import { TabLink, TabList } from 'flavours/glitch/components/tab_list';
import { useAccount } from 'flavours/glitch/hooks/useAccount';
import {
  useAccountId,
  useCurrentAccountId,
} from 'flavours/glitch/hooks/useAccountId';

import { CollectionsCreatedByAccount } from './overview/created_by_account';
import { CollectionsFeaturingYou } from './overview/featuring_you';
import classes from './styles.module.scss';

const messages = defineMessages({
  headingMe: {
    id: 'column.your_collections',
    defaultMessage: 'Your Collections',
  },
  headingOther: {
    id: 'column.other_collections',
    defaultMessage: "{name}'s Collections",
  },
  createdByYou: {
    id: 'collections.list.created_by_you',
    defaultMessage: 'Created by you',
  },
  createdByAuthor: {
    id: 'collections.list.created_by_author',
    defaultMessage: 'Created by {name}',
  },
  featuringYou: {
    id: 'collections.list.featuring_you',
    defaultMessage: 'Featuring you',
  },
});

export const Collections: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const intl = useIntl();
  const me = useCurrentAccountId();
  const accountId = useAccountId();
  const account = useAccount(accountId);
  const { path } = useRouteMatch();

  const isOwnCollectionsPage = accountId === me;

  const titleMessage = isOwnCollectionsPage
    ? messages.headingMe
    : messages.headingOther;

  const pageTitle = intl.formatMessage(titleMessage, {
    name: account?.get('display_name'),
  });
  const pageTitleHtml = intl.formatMessage(titleMessage, {
    name: <DisplayNameSimple account={account} />,
  });

  const createdByTabMessage = isOwnCollectionsPage
    ? messages.createdByYou
    : messages.createdByAuthor;

  return (
    <Column bindToDocument={!multiColumn} label={pageTitle}>
      <ColumnHeader showBackButton multiColumn={multiColumn} />

      <Scrollable>
        <header className={classes.header}>
          <NavigationFocusTarget as='h1' className={classes.heading}>
            {pageTitleHtml}
          </NavigationFocusTarget>
          <TabList plain>
            <TabLink exact to={`/@${account?.acct}/collections`}>
              {intl.formatMessage(createdByTabMessage, {
                name: <DisplayNameSimple account={account} />,
              })}
            </TabLink>
            {isOwnCollectionsPage && (
              <TabLink
                exact
                to={`/@${account?.acct}/collections/featuring-you`}
              >
                {intl.formatMessage(messages.featuringYou)}
              </TabLink>
            )}
          </TabList>
        </header>
        <Switch>
          <Route exact path={path} component={CollectionsCreatedByAccount} />
          <Route
            exact
            path={`${path}/featuring-you`}
            component={CollectionsFeaturingYou}
          />
        </Switch>
      </Scrollable>

      <Helmet>
        <title>{pageTitle}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};
