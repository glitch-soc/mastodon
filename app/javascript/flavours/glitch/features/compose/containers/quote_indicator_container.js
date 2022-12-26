import { connect } from 'react-redux';
import { cancelQuoteCompose } from 'flavours/glitch/actions/compose';
import QuoteIndicator from '../components/quote_indicator';

const makeMapStateToProps = () => {
  const mapStateToProps = state => {
    const statusId = state.getIn(['compose', 'quote_id']);
    const editing  = false;

    return {
      status: state.getIn(['statuses', statusId]),
      editing,
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = dispatch => ({

  onCancel () {
    dispatch(cancelQuoteCompose());
  },

});

export default connect(makeMapStateToProps, mapDispatchToProps)(QuoteIndicator);
