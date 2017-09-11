//  <CommonLink>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/common/link

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  The component
//  -------------

export default class CommonLink extends React.PureComponent {

  //  Props.
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    destination: PropTypes.string,
    history: PropTypes.object,
    href: PropTypes.string,
  };

  //  We only reroute the link if it is an unadorned click, we have
  //  access to the router, and there is somewhere to reroute it *to*.
  handleClick = (e) => {
    const { destination, history } = this.props;
    if (!history || !destination || e.button || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
    history.push(destination);
    e.preventDefault();
  }

  //  Rendering.
  render () {
    const { handleClick } = this;
    const { children, className, destination, history, href, ...others } = this.props;
    const computedClass = classNames('glitch', 'glitch__common__link', className);
    const conditionalProps = {};
    if (href) {
      conditionalProps.href = href;
      conditionalProps.onClick = handleClick;
    } else if (destination) {
      conditionalProps.onClick = handleClick;
      conditionalProps.role = 'link';
      conditionalProps.tabIndex = 0;
    } else conditionalProps.role = 'presentation';

    return (
      <a
        className={computedClass}
        {...conditionalProps}
        {...others}
        rel='noopener'
        target='_blank'
      >{children}</a>
    );
  }

}
