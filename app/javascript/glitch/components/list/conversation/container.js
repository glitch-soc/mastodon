//  <ListConversationContainer>
//  =================

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/list/conversation/container

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import { connect } from 'react-redux';

//  Mastodon imports.
import { fetchContext } from 'mastodon/actions/statuses';

//  Our imports.
import ListConversation from '.';

//  * * * * * * *  //

//  State mapping
//  -------------

const mapStateToProps = (state, { id }) => {
  return {
    ancestors   : state.getIn(['contexts', 'ancestors', id]),
    descendants : state.getIn(['contexts', 'descendants', id]),
  };
};

//  * * * * * * *  //

//  Dispatch mapping
//  ----------------

const mapDispatchToProps = (dispatch) => ({
  fetch (id) {
    dispatch(fetchContext(id));
  },
});

//  * * * * * * *  //

//  Connecting
//  ----------

export default connect(mapStateToProps, mapDispatchToProps)(ListConversation);
