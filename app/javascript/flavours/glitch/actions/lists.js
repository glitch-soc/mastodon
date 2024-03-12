import api from '../api';

import { showAlertForError } from './alerts';
import { importFetchedAccounts, importFetchedTags } from './importer';

export const LIST_FETCH_REQUEST = 'LIST_FETCH_REQUEST';
export const LIST_FETCH_SUCCESS = 'LIST_FETCH_SUCCESS';
export const LIST_FETCH_FAIL    = 'LIST_FETCH_FAIL';

export const LISTS_FETCH_REQUEST = 'LISTS_FETCH_REQUEST';
export const LISTS_FETCH_SUCCESS = 'LISTS_FETCH_SUCCESS';
export const LISTS_FETCH_FAIL    = 'LISTS_FETCH_FAIL';

export const LIST_EDITOR_TITLE_CHANGE = 'LIST_EDITOR_TITLE_CHANGE';
export const LIST_EDITOR_RESET        = 'LIST_EDITOR_RESET';
export const LIST_EDITOR_SETUP        = 'LIST_EDITOR_SETUP';

export const LIST_CREATE_REQUEST = 'LIST_CREATE_REQUEST';
export const LIST_CREATE_SUCCESS = 'LIST_CREATE_SUCCESS';
export const LIST_CREATE_FAIL    = 'LIST_CREATE_FAIL';

export const LIST_UPDATE_REQUEST = 'LIST_UPDATE_REQUEST';
export const LIST_UPDATE_SUCCESS = 'LIST_UPDATE_SUCCESS';
export const LIST_UPDATE_FAIL    = 'LIST_UPDATE_FAIL';

export const LIST_DELETE_REQUEST = 'LIST_DELETE_REQUEST';
export const LIST_DELETE_SUCCESS = 'LIST_DELETE_SUCCESS';
export const LIST_DELETE_FAIL    = 'LIST_DELETE_FAIL';

export const LIST_ACCOUNTS_FETCH_REQUEST = 'LIST_ACCOUNTS_FETCH_REQUEST';
export const LIST_ACCOUNTS_FETCH_SUCCESS = 'LIST_ACCOUNTS_FETCH_SUCCESS';
export const LIST_ACCOUNTS_FETCH_FAIL    = 'LIST_ACCOUNTS_FETCH_FAIL';

export const LIST_TAGS_FETCH_REQUEST = 'LIST_TAGS_FETCH_REQUEST';
export const LIST_TAGS_FETCH_SUCCESS = 'LIST_TAGS_FETCH_SUCCESS';
export const LIST_TAGS_FETCH_FAIL    = 'LIST_TAGS_FETCH_FAIL';

export const LIST_EDITOR_SUGGESTIONS_CHANGE = 'LIST_EDITOR_SUGGESTIONS_CHANGE';
export const LIST_EDITOR_SUGGESTIONS_READY  = 'LIST_EDITOR_SUGGESTIONS_READY';
export const LIST_EDITOR_SUGGESTIONS_CLEAR  = 'LIST_EDITOR_SUGGESTIONS_CLEAR';

export const LIST_EDITOR_ADD_REQUEST = 'LIST_EDITOR_ADD_REQUEST';
export const LIST_EDITOR_ADD_SUCCESS = 'LIST_EDITOR_ADD_SUCCESS';
export const LIST_EDITOR_ADD_FAIL    = 'LIST_EDITOR_ADD_FAIL';

export const LIST_EDITOR_REMOVE_REQUEST = 'LIST_EDITOR_REMOVE_REQUEST';
export const LIST_EDITOR_REMOVE_SUCCESS = 'LIST_EDITOR_REMOVE_SUCCESS';
export const LIST_EDITOR_REMOVE_FAIL    = 'LIST_EDITOR_REMOVE_FAIL';

export const LIST_ADDER_RESET = 'LIST_ADDER_RESET';
export const LIST_ADDER_SETUP = 'LIST_ADDER_SETUP';

export const LIST_ADDER_LISTS_FETCH_REQUEST = 'LIST_ADDER_LISTS_FETCH_REQUEST';
export const LIST_ADDER_LISTS_FETCH_SUCCESS = 'LIST_ADDER_LISTS_FETCH_SUCCESS';
export const LIST_ADDER_LISTS_FETCH_FAIL    = 'LIST_ADDER_LISTS_FETCH_FAIL';

export const fetchList = id => (dispatch, getState) => {
  if (getState().getIn(['lists', id])) {
    return;
  }

  dispatch(fetchListRequest(id));

  api(getState).get(`/api/v1/lists/${id}`)
    .then(({ data }) => dispatch(fetchListSuccess(data)))
    .catch(err => dispatch(fetchListFail(id, err)));
};

export const fetchListRequest = id => ({
  type: LIST_FETCH_REQUEST,
  id,
});

export const fetchListSuccess = list => ({
  type: LIST_FETCH_SUCCESS,
  list,
});

export const fetchListFail = (id, error) => ({
  type: LIST_FETCH_FAIL,
  id,
  error,
});

export const fetchLists = () => (dispatch, getState) => {
  dispatch(fetchListsRequest());

  api(getState).get('/api/v1/lists')
    .then(({ data }) => dispatch(fetchListsSuccess(data)))
    .catch(err => dispatch(fetchListsFail(err)));
};

export const fetchListsRequest = () => ({
  type: LISTS_FETCH_REQUEST,
});

export const fetchListsSuccess = lists => ({
  type: LISTS_FETCH_SUCCESS,
  lists,
});

export const fetchListsFail = error => ({
  type: LISTS_FETCH_FAIL,
  error,
});

export const submitListEditor = shouldReset => (dispatch, getState) => {
  const listId = getState().getIn(['listEditor', 'listId']);
  const title  = getState().getIn(['listEditor', 'title']);

  if (listId === null) {
    dispatch(createList(title, shouldReset));
  } else {
    dispatch(updateList(listId, title, shouldReset));
  }
};

export const setupListEditor = listId => (dispatch, getState) => {
  dispatch({
    type: LIST_EDITOR_SETUP,
    list: getState().getIn(['lists', listId]),
  });

  dispatch(fetchListAccounts(listId));
  dispatch(fetchListTags(listId));
};

export const changeListEditorTitle = value => ({
  type: LIST_EDITOR_TITLE_CHANGE,
  value,
});

export const createList = (title, shouldReset) => (dispatch, getState) => {
  dispatch(createListRequest());

  api(getState).post('/api/v1/lists', { title }).then(({ data }) => {
    dispatch(createListSuccess(data));

    if (shouldReset) {
      dispatch(resetListEditor());
    }
  }).catch(err => dispatch(createListFail(err)));
};

export const createListRequest = () => ({
  type: LIST_CREATE_REQUEST,
});

export const createListSuccess = list => ({
  type: LIST_CREATE_SUCCESS,
  list,
});

export const createListFail = error => ({
  type: LIST_CREATE_FAIL,
  error,
});

export const updateList = (id, title, shouldReset, isExclusive, replies_policy) => (dispatch, getState) => {
  dispatch(updateListRequest(id));

  api(getState).put(`/api/v1/lists/${id}`, { title, replies_policy, exclusive: typeof isExclusive === 'undefined' ? undefined : !!isExclusive }).then(({ data }) => {
    dispatch(updateListSuccess(data));

    if (shouldReset) {
      dispatch(resetListEditor());
    }
  }).catch(err => dispatch(updateListFail(id, err)));
};

export const updateListRequest = id => ({
  type: LIST_UPDATE_REQUEST,
  id,
});

export const updateListSuccess = list => ({
  type: LIST_UPDATE_SUCCESS,
  list,
});

export const updateListFail = (id, error) => ({
  type: LIST_UPDATE_FAIL,
  id,
  error,
});

export const resetListEditor = () => ({
  type: LIST_EDITOR_RESET,
});

export const deleteList = id => (dispatch, getState) => {
  dispatch(deleteListRequest(id));

  api(getState).delete(`/api/v1/lists/${id}`)
    .then(() => dispatch(deleteListSuccess(id)))
    .catch(err => dispatch(deleteListFail(id, err)));
};

export const deleteListRequest = id => ({
  type: LIST_DELETE_REQUEST,
  id,
});

export const deleteListSuccess = id => ({
  type: LIST_DELETE_SUCCESS,
  id,
});

export const deleteListFail = (id, error) => ({
  type: LIST_DELETE_FAIL,
  id,
  error,
});

export const fetchListAccounts = listId => (dispatch, getState) => {
  dispatch(fetchListAccountsRequest(listId));

  api(getState).get(`/api/v1/lists/${listId}/accounts`, { params: { limit: 0 } }).then(({ data }) => {
    dispatch(importFetchedAccounts(data));
    dispatch(fetchListAccountsSuccess(listId, data));
  }).catch(err => dispatch(fetchListAccountsFail(listId, err)));
};

export const fetchListAccountsRequest = id => ({
  type: LIST_ACCOUNTS_FETCH_REQUEST,
  id,
});

export const fetchListAccountsSuccess = (id, accounts, next) => ({
  type: LIST_ACCOUNTS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

export const fetchListAccountsFail = (id, error) => ({
  type: LIST_ACCOUNTS_FETCH_FAIL,
  id,
  error,
});

export const fetchListTags = listId => (dispatch, getState) => {
  dispatch(fetchListTagsRequest(listId));

  api(getState).get(`/api/v1/lists/${listId}/tags`, { params: { limit: 0 } }).then(({ data }) => {
    dispatch(importFetchedTags(data));
    dispatch(fetchListTagsSuccess(listId, data));
  }).catch(err => dispatch(fetchListTagsFail(listId, err)));
};

export const fetchListTagsFail = (id, error) => ({
  type: LIST_TAGS_FETCH_FAIL,
  id,
  error,
});

export const fetchListTagsRequest = id => ({
  type: LIST_TAGS_FETCH_REQUEST,
  id,
});

export const fetchListTagsSuccess = (id, tags, next) => ({
  type: LIST_TAGS_FETCH_SUCCESS,
  id,
  tags,
  next,
});

export const fetchListSuggestions = q => (dispatch, getState) => {
  const params = {
    q,
    resolve: false,
    limit: 4,
    following: true,
  };

  api(getState).get('/api/v1/accounts/search', { params }).then(({ data }) => {
    dispatch(importFetchedAccounts(data));
    dispatch(fetchListSuggestionsReady(q, data));
  }).catch(error => dispatch(showAlertForError(error)));
};

export const fetchListSuggestionsReady = (query, accounts) => ({
  type: LIST_EDITOR_SUGGESTIONS_READY,
  query,
  accounts,
});

export const clearListSuggestions = () => ({
  type: LIST_EDITOR_SUGGESTIONS_CLEAR,
});

export const changeListSuggestions = value => ({
  type: LIST_EDITOR_SUGGESTIONS_CHANGE,
  value,
});

export const addToListEditor = (id, type) => (dispatch, getState) => {
  dispatch(addToList(getState().getIn(['listEditor', 'listId']), id, type));
};

export const addToList = (listId, id, type) => (dispatch, getState) => {
  dispatch(addToListRequest(listId, id, type));
  
  if ('tags' === type) {
    api(getState).post(`/api/v1/lists/${listId}/tags`, { tag_ids: [id] })
      .then((data) => dispatch(addToListSuccess(listId, id, type, data)))
      .catch(err => dispatch(addToListFail(listId, id, type, err)));
  } else {
    api(getState).post(`/api/v1/lists/${listId}/accounts`, { account_ids: [id] })
      .then(() => dispatch(addToListSuccess(listId, id, type)))
      .catch(err => dispatch(addToListFail(listId, id, type, err)));
  }
};

export const addToListRequest = (listId, id, type) => ({
  type: LIST_EDITOR_ADD_REQUEST,
  addType: type,
  listId,
  id,
});

export const addToListSuccess = (listId, id, type, data) => ({
  type: LIST_EDITOR_ADD_SUCCESS,
  addType: type,
  listId,
  id,
  data,
});

export const addToListFail = (listId, id, type, error) => ({
  type: LIST_EDITOR_ADD_FAIL,
  addType: type,
  listId,
  id,
  error,
});

export const removeFromListEditor = (id, type) => (dispatch, getState) => {
  dispatch(removeFromList(getState().getIn(['listEditor', 'listId']), id, type));
};

export const removeFromList = (listId, id, type) => (dispatch, getState) => {
  dispatch(removeFromListRequest(listId, id, type));

  if ('tags' === type) {
    api(getState).delete(`/api/v1/lists/${listId}/tags`, { params: { tag_ids: [id] } })
      .then(() => dispatch(removeFromListSuccess(listId, id, type)))
      .catch(err => dispatch(removeFromListFail(listId, id, type, err)));
  } else {
    api(getState).delete(`/api/v1/lists/${listId}/accounts`, { params: { account_ids: [id] } })
      .then(() => dispatch(removeFromListSuccess(listId, id, type)))
      .catch(err => dispatch(removeFromListFail(listId, id, type, err)));
  }
};

export const removeFromListRequest = (listId, id, type) => ({
  type: LIST_EDITOR_REMOVE_REQUEST,
  removeType: type,
  listId,
  id,
});

export const removeFromListSuccess = (listId, id, type) => ({
  type: LIST_EDITOR_REMOVE_SUCCESS,
  removeType: type,
  listId,
  id,
});

export const removeFromListFail = (listId, id, type, error) => ({
  type: LIST_EDITOR_REMOVE_FAIL,
  removeType: type,
  listId,
  id,
  error,
});

export const resetListAdder = () => ({
  type: LIST_ADDER_RESET,
});

export const setupListAdder = accountId => (dispatch, getState) => {
  dispatch({
    type: LIST_ADDER_SETUP,
    account: getState().getIn(['accounts', accountId]),
  });
  dispatch(fetchLists());
  dispatch(fetchAccountLists(accountId));
};

export const fetchAccountLists = accountId => (dispatch, getState) => {
  dispatch(fetchAccountListsRequest(accountId));

  api(getState).get(`/api/v1/accounts/${accountId}/lists`)
    .then(({ data }) => dispatch(fetchAccountListsSuccess(accountId, data)))
    .catch(err => dispatch(fetchAccountListsFail(accountId, err)));
};

export const fetchAccountListsRequest = id => ({
  type:LIST_ADDER_LISTS_FETCH_REQUEST,
  id,
});

export const fetchAccountListsSuccess = (id, lists) => ({
  type: LIST_ADDER_LISTS_FETCH_SUCCESS,
  id,
  lists,
});

export const fetchAccountListsFail = (id, err) => ({
  type: LIST_ADDER_LISTS_FETCH_FAIL,
  id,
  err,
});

export const addToListAdder = listId => (dispatch, getState) => {
  dispatch(addToList(listId, getState().getIn(['listAdder', 'accountId'])));
};

export const removeFromListAdder = listId => (dispatch, getState) => {
  dispatch(removeFromList(listId, getState().getIn(['listAdder', 'accountId'])));
};

