import React from 'react';
import { connect } from 'react-redux';
import { expandHomeTimeline } from '../../actions/timelines';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import ColumnSettingsContainer from './containers/column_settings_container';
import Timeline from '../timeline';
import Link from 'react-router-dom/Link';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

const mapStateToProps = state => ({
  hasFollows: state.getIn(['accounts_counters', state.getIn(['meta', 'me']), 'following_count']) > 0,
});

@connect(mapStateToProps)
@injectIntl
export default class HomeTimeline extends React.PureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    hasFollows: PropTypes.bool,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
  };

  render () {
    const { intl, hasFollows, columnId, multiColumn } = this.props;

    let emptyMessage;

    if (hasFollows) {
      emptyMessage = <FormattedMessage id='empty_column.home.inactivity' defaultMessage='Your home feed is empty. If you have been inactive for a while, it will be regenerated for you soon.' />;
    } else {
      emptyMessage = <FormattedMessage id='empty_column.home' defaultMessage="You aren't following anyone yet. Visit {public} or use search to get started and meet other users." values={{ public: <Link to='/timelines/public'><FormattedMessage id='empty_column.home.public_timeline' defaultMessage='the public timeline' /></Link> }} />;
    }

    return (
      <Timeline
        expand={expandHomeTimeline}
        columnName='HOME'
        columnId={columnId}
        mulitColumn={multiColumn}
        emptyMessage={emptyMessage}
        icon='home'
        title={intl.formatMessage(messages.title)}
        settings={<ColumnSettingsContainer />}
        scrollName='home_timeline'
        timelineId='home'
      />
    );
  }

}
