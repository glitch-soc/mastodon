//  <StatusMissing>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/missing

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import React from 'react';
import { FormattedMessage } from 'react-intl';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  The component
//  -------------

const StatusMissing = () => (
  <div className='glitch glitch__status__missing'>
    <FormattedMessage id='missing_indicator.label' defaultMessage='Not found' />
  </div>
);

export default StatusMissing;
