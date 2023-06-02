import { Map as ImmutableMap, fromJS } from 'immutable';

import { STATUS_IMPORT, STATUSES_IMPORT } from '../actions/importer';
import {
  REBLOG_REQUEST,
  REBLOG_FAIL,
  FAVOURITE_REQUEST,
  FAVOURITE_FAIL,
  UNFAVOURITE_SUCCESS,
  BOOKMARK_REQUEST,
  BOOKMARK_FAIL,
  REACTION_UPDATE,
  REACTION_ADD_FAIL,
  REACTION_REMOVE_FAIL,
  REACTION_ADD_REQUEST,
  REACTION_REMOVE_REQUEST,
} from '../actions/interactions';
import {
  STATUS_MUTE_SUCCESS,
  STATUS_UNMUTE_SUCCESS,
  STATUS_REVEAL,
  STATUS_HIDE,
  STATUS_COLLAPSE,
  STATUS_TRANSLATE_SUCCESS,
  STATUS_TRANSLATE_UNDO,
  STATUS_FETCH_REQUEST,
  STATUS_FETCH_FAIL,
} from '../actions/statuses';
import { TIMELINE_DELETE } from '../actions/timelines';

const importStatus = (state, status) => state.set(status.id, fromJS(status));

const importStatuses = (state, statuses) =>
  state.withMutations(mutable => statuses.forEach(status => importStatus(mutable, status)));

const deleteStatus = (state, id, references) => {
  references.forEach(ref => {
    state = deleteStatus(state, ref, []);
  });

  return state.delete(id);
};

const updateReaction = (state, id, name, updater) => state.update(
  id,
  status => status.update(
    'reactions',
    reactions => {
      const index = reactions.findIndex(reaction => reaction.get('name') === name);
      if (index > -1) {
        return reactions.update(index, reaction => updater(reaction));
      } else {
        return reactions.push(updater(fromJS({ name, count: 0 })));
      }
    },
  ),
);

const updateReactionCount = (state, reaction) => updateReaction(state, reaction.status_id, reaction.name, x => x.set('count', reaction.count));

// The url parameter is only used when adding a new custom emoji reaction
// (one that wasn't in the reactions list before) because we don't have its
// URL yet.  In all other cases, it's undefined.
const addReaction = (state, id, name, url) => updateReaction(
  state,
  id,
  name,
  x => x.set('me', true)
    .update('count', n => n + 1)
    .update('url', old => old ? old : url)
    .update('static_url', old => old ? old : url),
);

const removeReaction = (state, id, name) => updateReaction(
  state,
  id,
  name,
  x => x.set('me', false).update('count', n => n - 1),
);

const initialState = ImmutableMap();

export default function statuses(state = initialState, action) {
  switch(action.type) {
  case STATUS_FETCH_REQUEST:
    return state.setIn([action.id, 'isLoading'], true);
  case STATUS_FETCH_FAIL:
    return state.delete(action.id);
  case STATUS_IMPORT:
    return importStatus(state, action.status);
  case STATUSES_IMPORT:
    return importStatuses(state, action.statuses);
  case FAVOURITE_REQUEST:
    return state.setIn([action.status.get('id'), 'favourited'], true);
  case UNFAVOURITE_SUCCESS:
    return state.updateIn([action.status.get('id'), 'favourites_count'], x => Math.max(0, x - 1));
  case FAVOURITE_FAIL:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'favourited'], false);
  case BOOKMARK_REQUEST:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'bookmarked'], true);
  case BOOKMARK_FAIL:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'bookmarked'], false);
  case REBLOG_REQUEST:
    return state.setIn([action.status.get('id'), 'reblogged'], true);
  case REBLOG_FAIL:
    return state.get(action.status.get('id')) === undefined ? state : state.setIn([action.status.get('id'), 'reblogged'], false);
  case REACTION_UPDATE:
    return updateReactionCount(state, action.reaction);
  case REACTION_ADD_REQUEST:
  case REACTION_REMOVE_FAIL:
    return addReaction(state, action.id, action.name, action.url);
  case REACTION_REMOVE_REQUEST:
  case REACTION_ADD_FAIL:
    return removeReaction(state, action.id, action.name);
  case STATUS_MUTE_SUCCESS:
    return state.setIn([action.id, 'muted'], true);
  case STATUS_UNMUTE_SUCCESS:
    return state.setIn([action.id, 'muted'], false);
  case STATUS_REVEAL:
    return state.withMutations(map => {
      action.ids.forEach(id => {
        if (!(state.get(id) === undefined)) {
          map.setIn([id, 'hidden'], false);
        }
      });
    });
  case STATUS_HIDE:
    return state.withMutations(map => {
      action.ids.forEach(id => {
        if (!(state.get(id) === undefined)) {
          map.setIn([id, 'hidden'], true);
        }
      });
    });
  case STATUS_COLLAPSE:
    return state.setIn([action.id, 'collapsed'], action.isCollapsed);
  case TIMELINE_DELETE:
    return deleteStatus(state, action.id, action.references);
  case STATUS_TRANSLATE_SUCCESS:
    return state.setIn([action.id, 'translation'], fromJS(action.translation));
  case STATUS_TRANSLATE_UNDO:
    return state.deleteIn([action.id, 'translation']);
  default:
    return state;
  }
}
