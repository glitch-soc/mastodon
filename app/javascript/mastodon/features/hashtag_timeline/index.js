import React from 'react';
import PropTypes from 'prop-types';
import {
  refreshHashtagTimeline,
  expandHashtagTimeline,
} from '../../actions/timelines';
import { FormattedMessage } from 'react-intl';
import Timeline from '../timeline';

export default class HashtagTimeline extends React.PureComponent {

  static propTypes = {
    params: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
  };

  componentWillMount () {
    const id = this.props.params.id;
    this.expand = () => expandHashtagTimeline(id);
    this.refresh = () => refreshHashtagTimeline(id);
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      const id = nextProps.params.id;
      this.expand = () => expandHashtagTimeline(id);
      this.refresh = () => refreshHashtagTimeline(id);
    }
  }

  render () {
    const { columnId, multiColumn } = this.props;
    const { id } = this.props.params;

    return (
      <Timeline
        expand={this.expand}
        refresh={this.refresh}
        streamId={`hashtag&tag=${id}`}
        columnName='HASHTAG'
        columnProps={{ id }}
        columnId={columnId}
        mulitColumn={multiColumn}
        emptyMessage={<FormattedMessage id='empty_column.hashtag' defaultMessage='There is nothing in this hashtag yet.' />}
        icon='hashtag'
        title={id}
        scrollName='hashtag_timeline'
        timelineId={`hashtag:${id}`}
      />
    );
  }

}
