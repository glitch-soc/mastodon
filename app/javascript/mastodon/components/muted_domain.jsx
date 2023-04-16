import React from 'react';
import PropTypes from 'prop-types';
import IconButton from './icon_button';
import { defineMessages, injectIntl } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';

const messages = defineMessages({
  unmute_domain: { id: 'account.unmute_domain', defaultMessage: 'Unmute domain {domain}' },
  exclude_domain_from_home_timeline: { id: 'account.exclude_domain_from_home_timeline', defaultMessage: 'Exclude domain {domain} from home timeline' },
  include_domain_from_home_timeline: { id: 'account.include_domain_from_home_timeline', defaultMessage: 'Include domain {domain} from home timeline' },
});

class MutedDomain extends ImmutablePureComponent {

  static propTypes = {
    domain: PropTypes.object.isRequired,
    onUnmuteDomain: PropTypes.func.isRequired,
    onExcludeDomainHomeTimeline: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleDomainUnmute = () => {
    this.props.onUnmuteDomain(this.props.domain.domain);
  };

  handleDomainExcludeHomeTimeline = () => {
    this.props.onExcludeDomainHomeTimeline(this.props.domain.domain, true);
  };

  handleDomainIncludeHomeTimeline = () => {
    this.props.onExcludeDomainHomeTimeline(this.props.domain.domain, false);
  };

  render () {
    const { domain: { domain, hide_from_home }, intl } = this.props;

    const buttons = [];
    if (hide_from_home) {
      buttons.push(
        <IconButton active icon='eye' title={intl.formatMessage(messages.include_domain_from_home_timeline, { domain })} onClick={this.handleDomainIncludeHomeTimeline} />,
      );
    } else {
      buttons.push(
        <IconButton active icon='eye-slash' title={intl.formatMessage(messages.exclude_domain_from_home_timeline, { domain })} onClick={this.handleDomainExcludeHomeTimeline} />,
      );
    }

    buttons.push(
      <IconButton active icon='volume-up' title={intl.formatMessage(messages.unmute_domain, { domain })} onClick={this.handleDomainUnmute} />,
    );

    return (
      <div className='domain'>
        <div className='domain__wrapper'>
          <span className='domain__domain-name'>
            <strong>{domain}</strong>
          </span>

          <div className='domain__buttons'>
            {buttons}
          </div>
        </div>
      </div>
    );
  }

}

export default injectIntl(MutedDomain);
