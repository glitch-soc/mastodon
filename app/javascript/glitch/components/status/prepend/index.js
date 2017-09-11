//  <StatusPrepend>
//  ==============

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/header

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports:
//  --------

//  Package imports.
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

//  Our imports.
import CommonIcon from 'glitch/components/common/icon';
import CommonLink from 'glitch/components/common/link';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  The component
//  -------------
export default class StatusPrepend extends React.PureComponent {

  //  Props.
  static propTypes = {
    comrade: ImmutablePropTypes.map.isRequired,
    history: PropTypes.object,
    type: PropTypes.string.isRequired,
  };

  //  This is a quick functional React component to get the prepend
  //  message.
  Message = () => {
    const { comrade, history, type } = this.props;
    let link = (
      <CommonLink
        className='prepend\comrade'
        destination={`/accounts/${comrade.get('id')}`}
        history={history}
        href={comrade.get('url')}
      >
        {comrade.get('display_name_html') || comrade.get('username')}
      </CommonLink>
    );
    switch (type) {
    case 'favourite':
      return (
        <FormattedMessage
          defaultMessage='{name} favourited your status'
          id='notification.favourite'
          values={{ name : link }}
        />
      );
    case 'reblog':
      return (
        <FormattedMessage
          defaultMessage='{name} boosted your status'
          id='notification.reblog'
          values={{ name : link }}
        />
      );
    case 'reblogged':
      return (
        <FormattedMessage
          defaultMessage='{name} boosted'
          id='status.reblogged_by'
          values={{ name : link }}
        />
      );
    }
    return null;
  }

  //  This renders the prepend icon and the prepend message in sequence.
  render () {
    const { Message } = this;
    const { type } = this.props;
    return type ? (
      <aside className='glitch glitch__status__prepend'>
        <CommonIcon
          className={`prepend\\icon prepend\\${type}`}
          name={type === 'favourite' ? 'star' : 'retweet'}
        />
        <Message />
      </aside>
    ) : null;
  }

}
