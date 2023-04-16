import api, { getLinks } from '../api';
import { openModal } from './modal';

export const DOMAIN_MUTE_REQUEST = 'DOMAIN_MUTE_REQUEST';
export const DOMAIN_MUTE_SUCCESS = 'DOMAIN_MUTE_SUCCESS';
export const DOMAIN_MUTE_FAIL    = 'DOMAIN_MUTE_FAIL';

export const DOMAIN_MUTE_HOME_TIMELINE_REQUEST = 'DOMAIN_MUTE_HOME_TIMELINE_REQUEST';
export const DOMAIN_MUTE_HOME_TIMELINE_SUCCESS = 'DOMAIN_MUTE_HOME_TIMELINE_SUCCESS';
export const DOMAIN_MUTE_HOME_TIMELINE_FAIL    = 'DOMAIN_MUTE_HOME_TIMELINE_FAIL';

export const DOMAIN_UNMUTE_REQUEST = 'DOMAIN_UNMUTE_REQUEST';
export const DOMAIN_UNMUTE_SUCCESS = 'DOMAIN_UNMUTE_SUCCESS';
export const DOMAIN_UNMUTE_FAIL    = 'DOMAIN_UNMUTE_FAIL';

export const DOMAIN_MUTES_FETCH_REQUEST = 'DOMAIN_MUTES_FETCH_REQUEST';
export const DOMAIN_MUTES_FETCH_SUCCESS = 'DOMAIN_MUTES_FETCH_SUCCESS';
export const DOMAIN_MUTES_FETCH_FAIL    = 'DOMAIN_MUTES_FETCH_FAIL';

export const DOMAIN_MUTES_EXPAND_REQUEST = 'DOMAIN_MUTES_EXPAND_REQUEST';
export const DOMAIN_MUTES_EXPAND_SUCCESS = 'DOMAIN_MUTES_EXPAND_SUCCESS';
export const DOMAIN_MUTES_EXPAND_FAIL    = 'DOMAIN_MUTES_EXPAND_FAIL';

export const DOMAIN_MUTES_INIT_MODAL = 'DOMAIN_MUTES_INIT_MODAL';
export const DOMAIN_MUTES_TOGGLE_HIDE_FROM_HOME = 'DOMAIN_MUTES_TOGGLE_HIDE_FROM_HOME';

export function muteDomain(domain, hideFromHome) {
  return (dispatch, getState) => {
    dispatch(muteDomainRequest(domain));

    api(getState).post('/api/v1/domain_mutes', { domain, hide_from_home: hideFromHome }).then(() => {
      const at_domain = '@' + domain;
      const accounts = getState().get('accounts').filter(item => item.get('acct').endsWith(at_domain)).valueSeq().map(item => item.get('id'));

      dispatch(muteDomainSuccess(domain, accounts));
    }).catch(err => {
      dispatch(muteDomainFail(domain, err));
    });
  };
}

export function excludeDomainHomeTimeline(domain, excludeHomeTimeline) {
  return (dispatch, getState) => {
    dispatch(excludeDomainHomeTimelineRequest(domain, excludeHomeTimeline));

    api(getState).post('/api/v1/domain_mutes', { domain, hide_from_home: excludeHomeTimeline }).then(() => {
      const at_domain = '@' + domain;
      const accounts = getState().get('accounts').filter(item => item.get('acct').endsWith(at_domain)).valueSeq().map(item => item.get('id'));

      dispatch(excludeDomainHomeTimelineSuccess(domain, excludeHomeTimeline, accounts));
    }).catch(err => {
      dispatch(excludeDomainHomeTimelineFail(domain, excludeHomeTimeline, err));
    });
  };
}

export function muteDomainRequest(domain) {
  return {
    type: DOMAIN_MUTE_REQUEST,
    domain,
  };
}

export function excludeDomainHomeTimelineRequest(domain, excludeHomeTimeline) {
  return {
    type: DOMAIN_MUTE_HOME_TIMELINE_REQUEST,
    domain,
    home_timeline: excludeHomeTimeline,
  };
}

export function muteDomainSuccess(domain, accounts) {
  return {
    type: DOMAIN_MUTE_SUCCESS,
    domain,
    accounts,
  };
}

export function muteDomainFail(domain, error) {
  return {
    type: DOMAIN_MUTE_FAIL,
    domain,
    error,
  };
}

export function excludeDomainHomeTimelineSuccess(domain, excludeHomeTimeline, accounts) {
  return {
    type: DOMAIN_MUTE_HOME_TIMELINE_SUCCESS,
    domain,
    homeTimeline: excludeHomeTimeline,
    accounts,
  };
}

export function excludeDomainHomeTimelineFail(domain, excludeHomeTimeline, error) {
  return {
    type: DOMAIN_MUTE_HOME_TIMELINE_FAIL,
    domain,
    homeTimeline: excludeHomeTimeline,
    error,
  };
}

export function unmuteDomain(domain) {
  return (dispatch, getState) => {
    dispatch(unmuteDomainRequest(domain));

    api(getState).delete('/api/v1/domain_mutes', { params: { domain } }).then(() => {
      const at_domain = '@' + domain;
      const accounts = getState().get('accounts').filter(item => item.get('acct').endsWith(at_domain)).valueSeq().map(item => item.get('id'));
      dispatch(unmuteDomainSuccess(domain, accounts));
    }).catch(err => {
      dispatch(unmuteDomainFail(domain, err));
    });
  };
}

export function unmuteDomainRequest(domain) {
  return {
    type: DOMAIN_UNMUTE_REQUEST,
    domain,
  };
}

export function unmuteDomainSuccess(domain, accounts) {
  return {
    type: DOMAIN_UNMUTE_SUCCESS,
    domain,
    accounts,
  };
}

export function unmuteDomainFail(domain, error) {
  return {
    type: DOMAIN_UNMUTE_FAIL,
    domain,
    error,
  };
}

export function fetchDomainMutes() {
  return (dispatch, getState) => {
    dispatch(fetchDomainMutesRequest());

    api(getState).get('/api/v1/domain_mutes').then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(fetchDomainMutesSuccess(response.data, next ? next.uri : null));
    }).catch(err => {
      dispatch(fetchDomainMutesFail(err));
    });
  };
}

export function fetchDomainMutesRequest() {
  return {
    type: DOMAIN_MUTES_FETCH_REQUEST,
  };
}

export function fetchDomainMutesSuccess(domains, next) {
  return {
    type: DOMAIN_MUTES_FETCH_SUCCESS,
    domains,
    next,
  };
}

export function fetchDomainMutesFail(error) {
  return {
    type: DOMAIN_MUTES_FETCH_FAIL,
    error,
  };
}

export function expandDomainMutes() {
  return (dispatch, getState) => {
    const url = getState().getIn(['domain_lists', 'mutes', 'next']);

    if (!url) {
      return;
    }

    dispatch(expandDomainMutesRequest());

    api(getState).get(url).then(response => {
      const next = getLinks(response).refs.find(link => link.rel === 'next');
      dispatch(expandDomainMutesSuccess(response.data, next ? next.uri : null));
    }).catch(err => {
      dispatch(expandDomainMutesFail(err));
    });
  };
}

export function expandDomainMutesRequest() {
  return {
    type: DOMAIN_MUTES_EXPAND_REQUEST,
  };
}

export function expandDomainMutesSuccess(domains, next) {
  return {
    type: DOMAIN_MUTES_EXPAND_SUCCESS,
    domains,
    next,
  };
}

export function expandDomainMutesFail(error) {
  return {
    type: DOMAIN_MUTES_EXPAND_FAIL,
    error,
  };
}

export function initDomainMuteModal(domain) {
  return dispatch => {
    dispatch({
      type: DOMAIN_MUTES_INIT_MODAL,
      domain,
    });

    dispatch(openModal('DOMAIN_MUTE'));
  };
}

export function toggleHideFromHome() {
  return dispatch => {
    dispatch({ type: DOMAIN_MUTES_TOGGLE_HIDE_FROM_HOME });
  };
}
