import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { omit } from 'lodash';

import { withOptionalRouter, WithOptionalRouterPropTypes } from 'flavours/glitch/utils/react_router';

class Permalink extends PureComponent {

  static propTypes = {
    className: PropTypes.string,
    href: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    children: PropTypes.node,
    onInterceptClick: PropTypes.func,
    ...WithOptionalRouterPropTypes,
  };

  handleClick = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      if (this.props.onInterceptClick && this.props.onInterceptClick()) {
        e.preventDefault();
        return;
      }

      if (this.props.history) {
        e.preventDefault();
        this.props.history.push(this.props.to);
      }
    }
  };

  render () {
    const {
      children,
      className,
      href,
      to,
      onInterceptClick,
      ...other
    } = this.props;

    // Use lodash omit method to remove router props, as we don't want these to be added to the link
    const extraAttributes = omit(other, [Object.keys(WithOptionalRouterPropTypes), 'staticContext'].flat());

    return (
      <a target='_blank' href={href} onClick={this.handleClick} {...extraAttributes} className={`permalink${className ? ' ' + className : ''}`}>
        {children}
      </a>
    );
  }

}

export default withOptionalRouter(Permalink);
