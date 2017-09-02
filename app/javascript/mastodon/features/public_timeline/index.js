import React from 'react';
import PropTypes from 'prop-types';
import {
  refreshPublicTimeline,
  expandPublicTimeline,
} from '../../actions/timelines';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ColumnSettingsContainer from './containers/column_settings_container';
import Timeline from '../timeline';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Federated timeline' },
});

@injectIntl
export default class PublicTimeline extends React.PureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
  };

  render () {
    const { intl, columnId, multiColumn } = this.props;

    return (
      <Timeline
        expand={expandPublicTimeline}
        refresh={refreshPublicTimeline}
        streamId='public'
        columnName='PUBLIC'
        columnId={columnId}
        mulitColumn={multiColumn}
        emptyMessage={<FormattedMessage id='empty_column.public' defaultMessage='There is nothing here! Write something publicly, or manually follow users from other instances to fill it up' />}
        icon='globe'
        title={intl.formatMessage(messages.title)}
        settings={<ColumnSettingsContainer />}
        scrollName='public_timeline'
        timelineId='public'
      />
    );
  }

}
