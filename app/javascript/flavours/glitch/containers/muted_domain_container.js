import React from 'react';
import { connect } from 'react-redux';
import { unmuteDomain, excludeDomainHomeTimeline, initDomainMuteModal } from '../actions/domain_mutes';
import { injectIntl } from 'react-intl';

import MutedDomain from '../components/muted_domain';

const makeMapStateToProps = () => {
  const mapStateToProps = () => ({});

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch) => ({
  onMuteDomain (domain) {
    dispatch(initDomainMuteModal(domain));
  },

  onUnmuteDomain (domain) {
    dispatch(unmuteDomain(domain));
  },

  onExcludeDomainHomeTimeline (domain, excludeHomeTimeline) {
    dispatch(excludeDomainHomeTimeline(domain, excludeHomeTimeline));
  },
});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(MutedDomain));
