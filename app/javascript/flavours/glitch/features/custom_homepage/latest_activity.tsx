import { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import { expandCommunityTimeline } from 'flavours/glitch/actions/timelines';
import { Callout } from 'flavours/glitch/components/callout';
import StatusListContainer from 'flavours/glitch/features/ui/containers/status_list_container';
import { useAppDispatch } from 'flavours/glitch/store';

import classes from './styles.module.scss';

export const LatestActivity = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(expandCommunityTimeline());
  }, [dispatch]);

  return (
    <StatusListContainer
      prepend={
        <Callout className={classes.banner}>
          <FormattedMessage
            id='custom_homepage.these_are_the_latest_posts'
            defaultMessage='These are the latest 40 posts from accounts on this server.'
          />
        </Callout>
      }
      scrollKey='custom_homepage'
      timelineId='community'
      maxItems={40}
      bindToDocument
    />
  );
};
