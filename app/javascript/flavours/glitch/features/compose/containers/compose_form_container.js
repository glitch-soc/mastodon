import { connect } from 'react-redux';

import {
  changeCompose,
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  changeComposeSpoilerText,
  insertEmojiCompose,
  uploadCompose,
} from 'flavours/glitch/actions/compose';
import { pasteLinkCompose, PRIVATE_QUOTE_MODAL_ID } from 'flavours/glitch/actions/compose_typed';
import { openModal } from 'flavours/glitch/actions/modal';
import { me } from 'flavours/glitch/initial_state';
import { privacyPreference } from 'flavours/glitch/utils/privacy_preference';

import ComposeForm from '../components/compose_form';

const urlLikeRegex = /^https?:\/\/[^\s]+\/[^\s]+$/i;

const sideArmPrivacy = state => {
  const inReplyTo = state.getIn(['compose', 'in_reply_to']);
  const replyPrivacy = inReplyTo ? state.getIn(['statuses', inReplyTo, 'visibility']) : null;
  const sideArmBasePrivacy = state.getIn(['local_settings', 'side_arm']);
  const sideArmRestrictedPrivacy = replyPrivacy && sideArmBasePrivacy !== 'none' ? privacyPreference(replyPrivacy, sideArmBasePrivacy) : null;
  let sideArmPrivacy = null;
  switch (state.getIn(['local_settings', 'side_arm_reply_mode'])) {
  case 'copy':
    sideArmPrivacy = replyPrivacy;
    break;
  case 'restrict':
    sideArmPrivacy = sideArmRestrictedPrivacy;
    break;
  }
  return sideArmPrivacy || sideArmBasePrivacy;
};

const processPasteOrDrop = (transfer, e, dispatch) => {
  if (transfer && transfer.files.length === 1) {
    dispatch(uploadCompose(transfer.files));
    e.preventDefault();
  } else if (transfer && transfer.files.length === 0) {
    const data = transfer.getData('text/plain');
    if (!data.match(urlLikeRegex)) return;

    try {
      const url = new URL(data);
      dispatch(pasteLinkCompose({ url }));
    } catch {
      return;
    }
  }
};

const mapStateToProps = state => ({
  text: state.getIn(['compose', 'text']),
  suggestions: state.getIn(['compose', 'suggestions']),
  spoiler: state.getIn(['local_settings', 'always_show_spoilers_field']) || state.getIn(['compose', 'spoiler']),
  spoilerAlwaysOn: state.getIn(['local_settings', 'always_show_spoilers_field']),
  spoilerText: state.getIn(['compose', 'spoiler_text']),
  privacy: state.getIn(['compose', 'privacy']),
  focusDate: state.getIn(['compose', 'focusDate']),
  caretPosition: state.getIn(['compose', 'caretPosition']),
  preselectDate: state.getIn(['compose', 'preselectDate']),
  preselectOnReply: state.getIn(['local_settings', 'preselect_on_reply']),
  isSubmitting: state.getIn(['compose', 'is_submitting']),
  isEditing: state.getIn(['compose', 'id']) !== null,
  isChangingUpload: state.getIn(['compose', 'is_changing_upload']),
  isUploading: state.getIn(['compose', 'is_uploading']),
  anyMedia: state.getIn(['compose', 'media_attachments']).size > 0,
  missingAltText: state.getIn(['compose', 'media_attachments']).some(media => ['image', 'gifv'].includes(media.get('type')) && (media.get('description') ?? '').length === 0),
  quoteToPrivate:
    !!state.getIn(['compose', 'quoted_status_id'])
    && state.getIn(['compose', 'privacy']) === 'private'
    && state.getIn(['statuses', state.getIn(['compose', 'quoted_status_id']), 'account']) !== me
    && !state.getIn(['settings', 'dismissed_banners', PRIVATE_QUOTE_MODAL_ID]),
  isInReply: state.getIn(['compose', 'in_reply_to']) !== null,
  lang: state.getIn(['compose', 'language']),
  sideArm: sideArmPrivacy(state),
  media: state.getIn(['compose', 'media_attachments']),
  maxChars: state.getIn(['server', 'server', 'item', 'configuration', 'statuses', 'max_characters'], 500),
});

const mapDispatchToProps = (dispatch, props) => ({

  onChange (text) {
    dispatch(changeCompose(text));
  },

  onSubmit ({ missingAltText, quoteToPrivate, overridePrivacy }) {
    if (missingAltText) {
      dispatch(openModal({
        modalType: 'CONFIRM_MISSING_ALT_TEXT',
        modalProps: { overridePrivacy },
      }));
    } else if (quoteToPrivate) {
      dispatch(openModal({
        modalType: 'CONFIRM_PRIVATE_QUOTE_NOTIFY',
        modalProps: {},
      }));
    } else {
      dispatch(submitCompose((status) => {
        if (props.redirectOnSuccess) {
          window.location.assign(status.url);
        }
      }, overridePrivacy));
    }
  },

  onClearSuggestions () {
    dispatch(clearComposeSuggestions());
  },

  onFetchSuggestions (token) {
    dispatch(fetchComposeSuggestions(token));
  },

  onSuggestionSelected (position, token, suggestion, path) {
    dispatch(selectComposeSuggestion(position, token, suggestion, path));
  },

  onChangeSpoilerText (checked) {
    dispatch(changeComposeSpoilerText(checked));
  },

  onPaste (e) {
    processPasteOrDrop(e.clipboardData, e, dispatch);
  },

  onDrop (e) {
    processPasteOrDrop(e.dataTransfer, e, dispatch);
  },

  onPickEmoji (position, data, needsSpace) {
    dispatch(insertEmojiCompose(position, data, needsSpace));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ComposeForm);
