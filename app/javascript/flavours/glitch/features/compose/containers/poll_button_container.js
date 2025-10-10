import { connect } from 'react-redux';

import { addPoll, removePoll } from '../../../actions/compose';
import PollButton from '../components/poll_button';

const mapStateToProps = state => {
  const hasAttachments = !!state.compose.get('is_uploading');
  const hasQuote = !!state.compose.get('quoted_status_id');

  return ({
    disabled: hasAttachments || hasQuote,
    active: state.getIn(['compose', 'poll']) !== null,
  });
};

const mapDispatchToProps = dispatch => ({

  onClick () {
    dispatch((_, getState) => {
      if (getState().getIn(['compose', 'poll'])) {
        dispatch(removePoll());
      } else {
        dispatch(addPoll());
      }
    });
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(PollButton);
