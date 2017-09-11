//  <CommonSeparator>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/common/separator

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

const CommonSeparator = ({
  className,
  visible,
  ...others
}) => visible ? (
  <span
    className={
      classNames('glitch', 'glitch__common__separator', className)
    }
    {...others}
    role='separator'
  />  //  Contents provided via CSS.
) : null;

//  Props.
CommonSeparator.propTypes = {
  className: PropTypes.string,
  visible: PropTypes.bool,
};

//  Export.
export default CommonSeparator;
