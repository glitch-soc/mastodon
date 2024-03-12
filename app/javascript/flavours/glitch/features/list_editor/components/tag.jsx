import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import CloseIcon from '@/material-icons/400-24px/close.svg?react';
import TagIcon from '@/material-icons/400-24px/tag.svg?react';
import { Icon } from 'flavours/glitch/components/icon';

import { removeFromListEditor, addToListEditor } from '../../../actions/lists';
import { IconButton } from '../../../components/icon_button';

const messages = defineMessages({
  remove: { id: 'lists.tag.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.tag.add', defaultMessage: 'Add to list' },
});

const makeMapStateToProps = () => {
  const mapStateToProps = (state, { tag, added }) => ({
    tag: tag,
    added: typeof added === 'undefined' ? state.getIn(['listEditor', 'tags', 'items']).includes(tag) : added,
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { tag }) => ({
  onRemove: () => dispatch(removeFromListEditor(tag.id, 'tags')),
  onAdd: () => dispatch(addToListEditor(tag.id, 'tags')),
});

class Tag extends ImmutablePureComponent {

  static propTypes = {
    tag: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    added: PropTypes.bool,
  };

  static defaultProps = {
    added: false,
  };

  render() {
    const { tag, intl, onRemove } = this.props;

    return (
      <div className='list_tag'>
        <Icon icon={TagIcon} />
        <div className='list_tag__display-name'>
          {tag.name}
        </div>

        <div className='list_tag__relationship'>
          <IconButton icon='times' iconComponent={CloseIcon} title={intl.formatMessage(messages.remove)} onClick={onRemove} />
        </div>
      </div>
    );
  }

}

export default connect(makeMapStateToProps, mapDispatchToProps)(injectIntl(Tag));
