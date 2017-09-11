//  <StatusFooter>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/footer

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
import { defineMessages, FormattedDate } from 'react-intl';

//  Mastodon imports.
import RelativeTimestamp from 'mastodon/components/relative_timestamp';

//  Our imports.
import CommonIcon from 'glitch/components/common/icon';
import CommonLink from 'glitch/components/common/link';
import CommonSeparator from 'glitch/components/common/separator';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Localization messages.
const messages = defineMessages({
  public     :
    { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted   :
    { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  private    :
    { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  direct     :
    { id: 'privacy.direct.short', defaultMessage: 'Direct' },
  permalink:
    { id: 'status.permalink', defaultMessage: 'Permalink' },
});

//  * * * * * * *  //

//  The component
//  -------------

export default class StatusFooter extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    application: ImmutablePropTypes.map.isRequired,
    datetime: PropTypes.string,
    detailed: PropTypes.bool,
    href: PropTypes.string,
    intl: PropTypes.object.isRequired,
    visibility: PropTypes.string,
  }

  //  Rendering.
  render () {
    const { application, datetime, detailed, href, intl, visibility } = this.props;
    const visibilityIcon = {
      public: 'globe',
      unlisted: 'unlock-alt',
      private: 'lock',
      direct: 'envelope',
    }[visibility];
    const computedClass = classNames('glitch', 'glitch__status__footer', {
      _detailed: detailed,
    });

    //  If our status isn't detailed, our footer only contains the
    //  relative timestamp and visibility information.
    if (!detailed) return (
      <footer className={computedClass}>
        <CommonLink
          className='footer\timestamp footer\link'
          href={href}
          title={intl.formatMessage(messages.permalink)}
        ><RelativeTimestamp timestamp={datetime} /></CommonLink>
        <CommonSeparator className='footer\separator' visible />
        <CommonIcon
          className='footer\icon'
          name={visibilityIcon}
          proportional
          title={intl.formatMessage(messages[visibility])}
        />
      </footer>
    );

    //  Otherwise, we give the full timestamp and include a link to the
    //  application which posted the status if applicable.
    return (
      <footer className={computedClass}>
        <CommonLink
          className='footer\timestamp'
          href={href}
          title={intl.formatMessage(messages.permalink)}
        >
          <FormattedDate
            value={new Date(datetime)}
            hour12={false}
            year='numeric'
            month='short'
            day='2-digit'
            hour='2-digit'
            minute='2-digit'
          />
        </CommonLink>
        <CommonSeparator className='footer\separator' visible={!!application} />
        {
          application ? (
            <CommonLink
              className='footer\application footer\link'
              href={application.get('website')}
            >{application.get('name')}</CommonLink>
          ) : null
        }
        <CommonSeparator className='footer\separator' visible />
        <CommonIcon
          name={visibilityIcon}
          className='footer\icon'
          proportional
          title={intl.formatMessage(messages[visibility])}
        />
      </footer>
    );
  }

}
