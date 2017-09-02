import React from 'react';
import PropTypes from 'prop-types';
import {
  refreshCommunityTimeline,
  expandCommunityTimeline,
} from '../../actions/timelines';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ColumnSettingsContainer from './containers/column_settings_container';
import Timeline from '../timeline';

const messages = defineMessages({
  title: { id: 'column.community', defaultMessage: 'Local timeline' },
});

@injectIntl
export default class CommunityTimeline extends React.PureComponent {

  static propTypes = {
    columnId: PropTypes.string,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  render () {
    const { intl, columnId, multiColumn } = this.props;

    return (
      <Timeline
        expand={expandCommunityTimeline}
        refresh={refreshCommunityTimeline}
        streamId='public:local'
        columnName='COMMUNITY'
        columnId={columnId}
        mulitColumn={multiColumn}
        emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
        icon='users'
        title={intl.formatMessage(messages.title)}
        settings={<ColumnSettingsContainer />}
        scrollName='community_timeline'
        timelineId='community'
      />
    );
  }

}
