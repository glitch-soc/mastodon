//  <StatusHeader>
//  ==============

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/header

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports:
//  --------

//  Package imports.
import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Our imports.
import CommonAvatar from 'glitch/components/common/avatar';
import CommonLink from 'glitch/components/common/link';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  The component:
//  --------------

export default class StatusHeader extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    comrade: ImmutablePropTypes.map,
    history: PropTypes.object,
  };

  //  Renders our component.
  render () {
    const {
      account,
      comrade,
      history,
    } = this.props;

    //  This displays our header.
    return (
      <header className='glitch glitch__status__header'>
        <CommonLink
          className='header\link'
          destination={`/accounts/${account.get('id')}`}
          history={history}
          href={account.get('url')}
        >
          <CommonAvatar
            account={account}
            className='header\avatar'
            comrade={comrade}
          />
        </CommonLink>
        <b
          className='header\display-name'
          dangerouslySetInnerHTML={{
            __html: account.get('display_name_html'),
          }}
        />
        <code className='header\account'>@{account.get('acct')}</code>
      </header>
    );
  }

}
