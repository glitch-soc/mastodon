import { useCallback, useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { PlusIcon } from '@phosphor-icons/react';
import { Helmet } from '@unhead/react/helmet';

import { Column } from '@/flavours/glitch/components/column';
import { ColumnHeader as LegacyColumnHeader } from '@/flavours/glitch/components/column/header';
import {
  ColumnHeader,
  ColumnHeaderButton,
  ColumnSettingsMenu,
} from '@/flavours/glitch/components/column_header';
import { MultiColumnMenuItems } from '@/flavours/glitch/components/column_header/multicolumn_settings';
import { openNewComposer } from '@/flavours/glitch/reducers/slices/composer';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';
import { isRedesignEnabled } from '@/flavours/glitch/utils/environment';
import MailIcon from '@/material-icons/400-24px/mail.svg?react';
import {
  addColumn,
  removeColumn,
  moveColumn,
} from 'flavours/glitch/actions/columns';
import {
  mountConversations,
  unmountConversations,
  expandConversations,
} from 'flavours/glitch/actions/conversations';
import { connectDirectStream } from 'flavours/glitch/actions/streaming';
import { expandDirectTimeline } from 'flavours/glitch/actions/timelines';
import StatusListContainer from 'flavours/glitch/features/ui/containers/status_list_container';

import { ConversationsList } from './components/conversations_list';
import ColumnSettingsContainer from './containers/column_settings_container';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Private mentions' },
  title_redesign: { id: 'tab_bar.messages', defaultMessage: 'Messages' },
});

interface ColumnBase {
  columnId?: string;
  multiColumn?: boolean;
}

const DirectTimeline: React.FC<ColumnBase> = ({ columnId, multiColumn }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const pinned = !!columnId;

  // glitch-soc additions
  const hasUnread = useAppSelector(
    (state) => (state.timelines.getIn(['direct', 'unread'], 0) as number) > 0,
  );
  const conversationsMode = useAppSelector((state) =>
    state.settings.getIn(['direct', 'conversations']),
  );

  const composeNewMessage = useCallback(() => {
    dispatch(openNewComposer({ type: 'message' }));
  }, [dispatch]);

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('DIRECT', {}));
    }
  }, [dispatch, columnId]);

  const handleMove = useCallback(
    (dir: number) => {
      dispatch(moveColumn(columnId, dir));
    },
    [dispatch, columnId],
  );

  const handleLoadMoreTimeline = useCallback(
    (maxId: string) => {
      void dispatch(expandDirectTimeline({ maxId }));
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(mountConversations());

    if (conversationsMode) {
      dispatch(expandConversations());
    } else {
      void dispatch(expandDirectTimeline());
    }

    const disconnect = dispatch(connectDirectStream());

    return () => {
      dispatch(unmountConversations());
      disconnect();
    };
  }, [dispatch, conversationsMode]);

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.title)}
    >
      {isRedesignEnabled() ? (
        <ColumnHeader
          title={intl.formatMessage(messages.title_redesign)}
          withBackButton={multiColumn && !pinned && 'auto'}
          extraButtons={
            <>
              <ColumnHeaderButton
                showTextOnDesktop
                variant='solid'
                icon={PlusIcon}
                onClick={composeNewMessage}
              >
                <FormattedMessage id='messages.new' defaultMessage='New' />
              </ColumnHeaderButton>
              {multiColumn && (
                <ColumnSettingsMenu
                  labelPrefix={intl.formatMessage(messages.title_redesign)}
                >
                  <MultiColumnMenuItems
                    onPin={handlePin}
                    onMove={handleMove}
                    pinned={pinned}
                  />
                </ColumnSettingsMenu>
              )}
            </>
          }
        />
      ) : (
        <LegacyColumnHeader
          icon='envelope'
          iconComponent={MailIcon}
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={handlePin}
          onMove={handleMove}
          pinned={pinned}
          multiColumn={multiColumn}
          scrollTopOnClick
        >
          <ColumnSettingsContainer />
        </LegacyColumnHeader>
      )}
      {conversationsMode ? (
        <ConversationsList
          trackScroll={!pinned}
          scrollKey={`direct_timeline-${columnId}`}
          emptyMessage={
            <FormattedMessage
              id='empty_column.direct'
              defaultMessage="You don't have any private mentions yet. When you send or receive one, it will show up here."
            />
          }
          bindToDocument={!multiColumn}
          prepend={
            <div className='follow_requests-unlocked_explanation'>
              <span>
                <FormattedMessage
                  id='compose_form.encryption_warning'
                  defaultMessage='Posts on Mastodon are not end-to-end encrypted. Do not share any dangerous information over Mastodon.'
                />{' '}
                <a
                  href='https://docs.joinmastodon.org/user/posting/#private'
                  rel='noreferrer'
                  target='_blank'
                >
                  <FormattedMessage
                    id='compose_form.direct_message_warning_learn_more'
                    defaultMessage='Learn more'
                  />
                </a>
              </span>
            </div>
          }
          alwaysPrepend
        />
      ) : (
        <StatusListContainer
          trackScroll={!pinned}
          scrollKey={`direct_timeline-${columnId}`}
          timelineId='direct'
          bindToDocument={!multiColumn}
          onLoadMore={handleLoadMoreTimeline}
          prepend={
            <div className='follow_requests-unlocked_explanation'>
              <span>
                <FormattedMessage
                  id='compose_form.encryption_warning'
                  defaultMessage='Posts on Mastodon are not end-to-end encrypted. Do not share any dangerous information over Mastodon.'
                />{' '}
                <a href='/terms' target='_blank'>
                  <FormattedMessage
                    id='compose_form.direct_message_warning_learn_more'
                    defaultMessage='Learn more'
                  />
                </a>
              </span>
            </div>
          }
          alwaysPrepend
          emptyMessage={
            <FormattedMessage
              id='empty_column.direct'
              defaultMessage="You don't have any private mentions yet. When you send or receive one, it will show up here."
            />
          }
        />
      )}

      <Helmet>
        <title>
          {intl.formatMessage(
            isRedesignEnabled() ? messages.title_redesign : messages.title,
          )}
        </title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default DirectTimeline;
