//  <CommonButton>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/common/button

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';

//  Our imports.
import CommonLink from 'glitch/components/common/link';
import CommonIcon from 'glitch/components/common/icon';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  The component
//  -------------

export default class CommonButton extends React.PureComponent {

  static propTypes = {
    active: PropTypes.bool,
    animate: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    href: PropTypes.string,
    icon: PropTypes.string,
    onClick: PropTypes.func,
    showTitle: PropTypes.bool,
    title: PropTypes.string,
  }
  state = {
    loaded: false,
  }

  //  The `loaded` state property activates our animations. We wait
  //  until an activation change in order to prevent unsightly
  //  animations when the component first mounts.
  componentWillReceiveProps (nextProps) {
    const { active } = this.props;

    //  The double "not"s here cast both arguments to booleans.
    if (!nextProps.active !== !active) this.setState({ loaded: true });
  }

  handleClick = (e) => {
    const { onClick } = this.props;
    if (!onClick) return;
    onClick(e);
    e.preventDefault();
  }

  //  Rendering the component.
  render () {
    const { handleClick } = this;
    const {
      active,
      animate,
      children,
      className,
      disabled,
      href,
      icon,
      onClick,
      showTitle,
      title,
      ...others
    } = this.props;
    const { loaded } = this.state;
    const computedClass = classNames('glitch', 'glitch__common__button', className, {
      _active: active && !href,  //  Links can't be active
      _animated: animate && loaded,
      _disabled: disabled,
      _link: href,
      _star: icon === 'star',
      '_with-text': children || title && showTitle,
    });
    let conditionalProps = {};

    //  If href is provided, we render a link.
    if (href) {
      if (!disabled && href) conditionalProps.href = href;
      if (title && !showTitle) {
        if (!children) conditionalProps.title = title;
        else conditionalProps['aria-label'] = title;
      }
      if (onClick) {
        if (!disabled) conditionalProps.onClick = handleClick;
        else conditionalProps['aria-disabled'] = true;
        conditionalProps.role = 'button';
        conditionalProps.tabIndex = 0;
      }
      return (
        <CommonLink
          className={computedClass}
          {...conditionalProps}
          {...others}
        >
          {children}
          {title && showTitle ? <span className='button\title'>{title}</span> : null}
          <CommonIcon name={icon} className='button\icon' />
        </CommonLink>
      );

    //  Otherwise, we render a button.
    } else {
      if (active !== void 0) conditionalProps['aria-pressed'] = active;
      if (title && !showTitle) {
        if (!children) conditionalProps.title = title;
        else conditionalProps['aria-label'] = title;
      }
      if (onClick && !disabled) {
        conditionalProps.onClick = handleClick;
      }
      return (
        <button
          className={computedClass}
          {...conditionalProps}
          disabled={disabled}
          {...others}
          tabIndex='0'
          type='button'
        >
          {children}
          {title && showTitle ? <span className='button\title'>{title}</span> : null}
          <CommonIcon name={icon} className='button\icon' />
        </button>
      );
    }
  };

}
