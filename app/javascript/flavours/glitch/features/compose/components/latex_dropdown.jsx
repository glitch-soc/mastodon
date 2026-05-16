import PropTypes from 'prop-types';
import React from 'react';

import { defineMessages } from 'react-intl';

import classNames from 'classnames';

import { supportsPassiveEvents } from 'detect-passive-events';
import Overlay from 'react-overlays/Overlay';

import { Icon } from 'flavours/glitch/components/icon';
import FunctionsIcon from '@/material-icons/400-24px/functions.svg?react';
import { assetHost } from 'flavours/glitch/utils/config';

import { injectIntl } from '@/flavours/glitch/components/intl';

const messages = defineMessages({
  inline_short:  { id: 'latex.inline.short', defaultMessage: 'Inline' },
  inline_long:   { id: 'latex.inline.long', defaultMessage: 'Notation that sits inline with other text' },
  display_short: { id: 'latex.display.short', defaultMessage: 'Display-mode' },
  display_long:  { id: 'latex.display.long', defaultMessage: 'Notation that sits on its own line' },
  start_latex:  { id: 'latex.start', defaultMessage: 'Start writing LaTeX' },
});

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

class LaTeXDropdownMenu extends React.PureComponent {

  static propTypes = {
    style: PropTypes.object,
    items: PropTypes.array.isRequired,
    placement: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any
  };

  state = {
    mounted: false,
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
    }
  };

  handleKeyDown = e => {
    const { items } = this.props;
    const value = e.currentTarget.getAttribute('data-index');
    const index = items.findIndex(item => {
      return (item.value === value);
    });
    let element = null;

    switch(e.key) {
    case 'Escape':
      this.props.onClose();
      break;
    case 'Enter':
      this.handleClick(e);
      break;
    case 'ArrowDown':
      element = this.node.childNodes[index + 1] || this.node.firstChild;
      break;
    case 'ArrowUp':
      element = this.node.childNodes[index - 1] || this.node.lastChild;
      break;
    case 'Tab':
      if (e.shiftKey) {
        element = this.node.childNodes[index - 1] || this.node.lastChild;
      } else {
        element = this.node.childNodes[index + 1] || this.node.firstChild;
      }
      break;
    case 'Home':
      element = this.node.firstChild;
      break;
    case 'End':
      element = this.node.lastChild;
      break;
    }

    if (element) {
      element.focus();
      this.props.onChange(element.getAttribute('data-index'));
      e.preventDefault();
      e.stopPropagation();
    }
  };

  handleClick = e => {
    const value = e.currentTarget.getAttribute('data-index');

    e.preventDefault();

    this.props.onClose();
    this.props.onChange(value);
  };

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
    if (this.focusedItem) this.focusedItem.focus({ preventScroll: true });
    this.setState({ mounted: true });
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  };

  setFocusRef = c => {
    this.focusedItem = c;
  };

  render () {
    const { mounted } = this.state;
    const { style, items, placement, value } = this.props;

    return (
      // It should not be transformed when mounting because the resulting
      // size will be used to determine the coordinate of the menu by
      // react-overlays
      <div className={`latex-dropdown__dropdown ${placement}`} style={{
        ...style,
        visibility: mounted ? 'visible' : 'hidden',
      }} role='listbox' ref={this.setRef}>
        {items.map(item => (
          <div role='option' tabIndex='0' key={item.value} data-index={item.value} onKeyDown={this.handleKeyDown} onClick={this.handleClick} className={classNames('latex-dropdown__option', { active: item.value === value })} aria-selected={item.value === value} ref={item.value === value ? this.setFocusRef : null}>
            <div className='latex-dropdown__option__icon'>
              <img
                className={classNames('latex-icon')}
                alt={item.value}
                src={`${assetHost}/latex/${item.icon}.svg`}
              />
              <Icon icon={FunctionsIcon} id={item.icon} fixedWidth />
            </div>

            <div className='latex-dropdown__option__content'>
              <strong>{item.text}</strong>
              {item.meta}
            </div>
          </div>
        ))}
      </div>
    );
  }

}


class LaTeXDropdown extends React.PureComponent {

  static propTypes = {
    isUserTouching: PropTypes.func,
    onModalOpen: PropTypes.func,
    onModalClose: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    container: PropTypes.func,
    disabled: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    button: PropTypes.node,
    value: PropTypes.any
  };

  state = {
    open: false,
    placement: 'bottom',
  };

  constructor(props) {
    super();

    this.props = props;

    const { intl: { formatMessage } } = this.props;

    this.options = [
      { icon: 'inline-mode', value: 'inline', text: formatMessage(messages.inline_short), meta: formatMessage(messages.inline_long) },
      { icon: 'display-mode', value: 'display', text: formatMessage(messages.display_short), meta: formatMessage(messages.display_long) },
    ];
  }

  handleToggle = ({ target }) => {
    if (this.props.isUserTouching && this.props.isUserTouching()) {
      if (this.state.open) {
        this.props.onModalClose();
      } else {
        this.props.onModalOpen({
          actions: this.options.map(option => ({ ...option, active: option.value === this.props.value })),
          onClick: this.handleModalActionClick,
        });
      }
    } else {
      const { top } = target.getBoundingClientRect();
      if (this.state.open && this.activeElement) {
        this.activeElement.focus({ preventScroll: true });
      }
      this.setState({ placement: top * 2 < innerHeight ? 'bottom' : 'top' });
      this.setState({ open: !this.state.open });
    }
  };

  handleModalActionClick = (e) => {
    e.preventDefault();

    const { value } = this.options[e.currentTarget.getAttribute('data-index')];

    this.props.onModalClose();
    this.props.onChange(value);
  };

  handleKeyDown = e => {
    switch(e.key) {
    case 'Escape':
      this.handleClose();
      break;
    }
  };

  handleMouseDown = () => {
    if (!this.state.open) {
      this.activeElement = document.activeElement;
    }
  };

  handleButtonKeyDown = (e) => {
    switch(e.key) {
    case ' ':
    case 'Enter':
      this.handleMouseDown();
      break;
    }
  };

  handleClose = () => {
    if (this.state.open && this.activeElement) {
      this.activeElement.focus({ preventScroll: true });
    }
    this.setState({ open: false });
  };

  handleChange = value => {
    this.props.onChange(value);
  };

  setTargetRef = c => {
    this.target = c;
  };

  findTarget = () => {
    return this.target;
  };

  render () {
    const { container, intl, button } = this.props;
    const { open, placement } = this.state;

    const title = intl.formatMessage(messages.start_latex);

    return (
      <div className={classNames('latex-dropdown', placement, { active: open })} onKeyDown={this.handleKeyDown}>
        <div ref={this.setTargetRef} className='latex-button' title={title} aria-label={title} aria-expanded={open} role='button' onClick={this.handleToggle} onKeyDown={this.handleButtonKeyDown} onMouseDown={this.handleMouseDown} tabIndex={0}>
          {button || <img
            className={classNames('latex-icon')}
            alt='𝑥'
            src={`${assetHost}/latex/latex-icon.svg`}
          />}
        </div>

        <Overlay show={open} placement={placement} target={this.findTarget} container={container}>
          {({ props, placement })=> (
            <div {...props} style={{ ...props.style, width:299}}>
              <div className={`dropdown-animation ${placement}`}>
                <LaTeXDropdownMenu
                  items={this.options}
                  onClose={this.handleClose}
                  onChange={this.handleChange}
                  placement={placement}
                />
              </div>
            </div>
          )}
        </Overlay>
      </div>
    );
  }

}

export default injectIntl(LaTeXDropdown);
