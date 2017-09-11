//  <StatusContentUnknown>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/content/unknown

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Our imports.
import CommonIcon from 'glitch/components/common/icon';
import CommonLink from 'glitch/components/common/link';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  The component
//  -------------
export default class StatusContentUnknown extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    attachments: ImmutablePropTypes.list.isRequired,
    fullwidth: PropTypes.bool,
  }

  render () {
    const { attachments, fullwidth } = this.props;
    const computedClass = classNames('glitch', 'glitch__status__content__unknown', {
      _fullwidth: fullwidth,
    });

    return (
      <ul className={computedClass}>
        {attachments.map(attachment => (
          <li
            className='unknown\attachment'
            key={attachment.get('id')}
          >
            <CommonLink
              className='unknown\link'
              href={attachment.get('remote_url')}
            >
              <CommonIcon
                className='unknown\icon'
                name='link'
              />
              {attachment.get('title') || attachment.get('remote_url')}
            </CommonLink>
          </li>
        ))}
      </ul>
    );
  }

}
