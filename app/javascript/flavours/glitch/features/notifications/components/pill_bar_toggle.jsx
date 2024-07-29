import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import classNames from 'classnames';

export default class PillBarToggle extends PureComponent {

  static propTypes = {
    id: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    label: PropTypes.node.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  };

  onChange = () => {
    this.props.onChange(!this.props.active);
  };

  render () {
    const { id, active, label, disabled } = this.props;
    const prop_id = ['setting-pillbar-button', id].filter(Boolean).join('-');

    return (
      <button
        key={prop_id}
        id={prop_id}
        className={classNames('pillbar-button', { active })}
        disabled={disabled}
        onClick={this.onChange}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  }
}
