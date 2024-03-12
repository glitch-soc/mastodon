import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import { connect } from 'react-redux';

import CancelIcon from '@/material-icons/400-24px/cancel.svg?react';
import TagIcon from '@/material-icons/400-24px/tag.svg?react';
import { Icon } from 'flavours/glitch/components/icon';

import { changeListSuggestions } from '../../../actions/lists';
import { addToListEditor } from '../../../actions/lists';

const messages = defineMessages({
  addtag: { id: 'lists.addtag', defaultMessage: 'Enter a tag you\'d like to follow' },
});

const mapStateToProps = state => ({
  value: state.getIn(['listEditor', 'suggestions', 'value']),
});

const mapDispatchToProps = dispatch => ({
  onSubmit: value => dispatch(addToListEditor(value, 'tags')),
  onChange: value => dispatch(changeListSuggestions(value)),
});

class AddTag extends PureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
  };

  handleChange = e => {
    //this.props.value = e.target.value;
    this.props.onChange(e.target.value);
  };

  handleKeyUp = e => {
    if (e.keyCode === 13) {
      this.props.onSubmit(this.props.value);
    }
  };

  render() {
    const { value, intl } = this.props;
    const hasValue = value.length > 0;

    return (
      <div className='list-editor__search search'>
        <label>
          <span style={{ display: 'none' }}>{intl.formatMessage(messages.addtag)}</span>
          <input
            className='search__input'
            type='text'
            value={value}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            placeholder={intl.formatMessage(messages.addtag)}
          />
        </label>

        <div role='button' tabIndex={0} className='search__icon'>
          <Icon id='add' icon={TagIcon} className={classNames({ active: !hasValue })} />
          <Icon id='times-circle' icon={CancelIcon} aria-label={intl.formatMessage(messages.addtag)} className={classNames({ active: hasValue })} />
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(AddTag));
