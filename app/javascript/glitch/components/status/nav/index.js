//  <StatusNav>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/nav

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { defineMessages } from 'react-intl';

//  Our imports.
import CommonIcon from 'glitch/components/common/icon';
import CommonLink from 'glitch/components/common/link';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Localization messages.
const messages = defineMessages({
  conversation:
    { id : 'status.view_conversation', defaultMessage : 'View conversation' },
  reblogs:
    { id : 'status.view_reblogs', defaultMessage : 'View reblogs' },
  favourites:
    { id : 'status.view_favourites', defaultMessage : 'View favourites' },
});

//  * * * * * * *  //

//  The component
//  -------------

export default class StatusNav extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    id: PropTypes.number.isRequired,
    intl: PropTypes.object.isRequired,
  }

  //  Rendering.
  render () {
    const { id, intl } = this.props;
    return (
      <nav className='glitch glitch__status__nav'>
        <CommonLink
          className='nav\conversation'
          destination={`/statuses/${id}`}
          title={intl.formatMessage(messages.conversation)}
        >
          <CommonIcon
            className='nav\icon'
            name='comments-o'
          />
        </CommonLink>
        <CommonLink
          className='nav\reblogs'
          destination={`/statuses/${id}/reblogs`}
          title={intl.formatMessage(messages.reblogs)}
        >
          <CommonIcon
            className='nav\icon'
            name='retweet'
          />
        </CommonLink>
        <CommonLink
          className='nav\favourites'
          destination={`/statuses/${id}/favourites`}
          title={intl.formatMessage(messages.favourites)}
        >
          <CommonIcon
            className='nav\icon'
            name='star'
          />
        </CommonLink>
      </nav>
    );
  }

}
