import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import spring from 'react-motion/lib/spring';

import { setupListEditor, clearListSuggestions, resetListEditor } from '../../actions/lists';
import Motion from '../ui/util/optional_motion';

import Account from './components/account';
import AddTag from './components/add_tag';
import EditListForm from './components/edit_list_form';
import Search from './components/search';
import Tag from './components/tag';

const messages = defineMessages({
  account_tab: { id: 'lists.account_tab', defaultMessage: 'Accounts' },
  tag_tab: { id: 'lists.tag_tab', defaultMessage: 'Tags' },
});

const mapStateToProps = state => ({
  tags: state.getIn(['listEditor', 'tags', 'items']),
  accountIds: state.getIn(['listEditor', 'accounts', 'items']),
  searchAccountIds: state.getIn(['listEditor', 'suggestions', 'items']),
});

const mapDispatchToProps = dispatch => ({
  onInitialize: listId => dispatch(setupListEditor(listId)),
  onClear: () => dispatch(clearListSuggestions()),
  onReset: () => dispatch(resetListEditor()),
});

class ListEditor extends ImmutablePureComponent {
  state = {
    currentTab: 'accounts',
  };

  static propTypes = {
    listId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    onInitialize: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    tags: ImmutablePropTypes.list.isRequired,
    accountIds: ImmutablePropTypes.list.isRequired,
    searchAccountIds: ImmutablePropTypes.list.isRequired,
  };

  componentDidMount() {
    const { onInitialize, listId } = this.props;
    onInitialize(listId);
  }

  componentWillUnmount() {
    const { onReset } = this.props;
    onReset();
  }

  constructor(props) {
    super(props);
    this.switchToAccounts = this.switchToAccounts.bind(this);
    this.switchToTags = this.switchToTags.bind(this);
  }

  switchToAccounts() {
    this.setState({ currentTab: 'accounts' });
  }

  switchToTags() {
    this.setState({ currentTab: 'tags' });
  }

  render() {
    const { accountIds, tags, searchAccountIds, onClear, intl } = this.props;
    const showSearch = searchAccountIds.size > 0;
    return (
      <div className='modal-root__modal list-editor'>{this.state.currentTab}
        <EditListForm />
        <div className='tab__container'>
          <button onClick={this.switchToAccounts} className={'tab ' + ('accounts' === this.state.currentTab ? 'tab__active' : '')}>{intl.formatMessage(messages.account_tab)} ({accountIds.size})</button>
          <button onClick={this.switchToTags} className={'tab ' + ('tags' === this.state.currentTab ? 'tab__active' : '')}>{intl.formatMessage(messages.tag_tab)} ({tags.size})</button>
        </div>
        <div id='list_editor_accounts' className={'accounts' === this.state.currentTab ? 'tab__active' : 'tab__inactive'}>
          <Search />
          <div className='drawer__pager'>
            <div className='drawer__inner list-editor__accounts'>
              {accountIds.map(accountId => <Account key={accountId} accountId={accountId} added />)}
            </div>

            {showSearch && <div role='button' tabIndex={-1} className='drawer__backdrop' onClick={onClear} />}

            <Motion defaultStyle={{ x: -100 }} style={{ x: spring(showSearch ? 0 : -100, { stiffness: 210, damping: 20 }) }}>
              {({ x }) => (
                <div className='drawer__inner backdrop' style={{ transform: x === 0 ? null : `translateX(${x}%)`, visibility: x === -100 ? 'hidden' : 'visible' }}>
                  {searchAccountIds.map(accountId => <Account key={accountId} accountId={accountId} />)}
                </div>
              )}
            </Motion>
          </div>
        </div>
        <div id='list_editor_tags' className={'tags' === this.state.currentTab ? 'tab__active' : 'tab__inactive'}>
          <AddTag />
          <div className='drawer__pager'>
            <div className='drawer__inner list-editor__accounts'>
              {tags.map(tag => <Tag key={tag.name} tag={tag} added />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ListEditor));
