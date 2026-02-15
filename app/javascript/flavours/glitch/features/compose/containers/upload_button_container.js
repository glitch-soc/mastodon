import { connect } from 'react-redux';

import { uploadCompose } from '../../../actions/compose';
import { openModal } from '../../../actions/modal';
import UploadButton from '../components/upload_button';

const mapStateToProps = state => {
  const isUploading = state.getIn(['compose', 'is_uploading']);
  const readyAttachmentsSize = state.getIn(['compose', 'media_attachments']).size ?? 0;
  const pendingAttachmentsSize = state.getIn(['compose', 'pending_media_attachments']).size ?? 0;
  const attachmentsSize = readyAttachmentsSize + pendingAttachmentsSize;
  const isOverLimit = attachmentsSize > state.getIn(['server', 'server', 'configuration', 'statuses', 'max_media_attachments'])-1;
  const hasVideoOrAudio = state.getIn(['compose', 'media_attachments']).some(m => ['video', 'audio'].includes(m.get('type')));
  const hasQuote = !!state.compose.get('quoted_status_id');

  return {
    disabled: isUploading || isOverLimit || hasVideoOrAudio || hasQuote,
    resetFileKey: state.getIn(['compose', 'resetFileKey']),
  };
};

const mapDispatchToProps = dispatch => ({

  onSelectFile(files) {
    dispatch(uploadCompose(files));
  },

  onDoodleOpen() {
    dispatch(openModal({
      modalType: 'DOODLE',
      modalProps: { noEsc: true, noClose: true },
    }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);
