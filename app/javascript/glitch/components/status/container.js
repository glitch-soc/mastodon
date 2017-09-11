//  <StatusContainer>
//  =================

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/container

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import React from 'react';
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
} from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { createStructuredSelector } from 'reselect';

//  Mastodon imports.
import { blockAccount, muteAccount } from 'mastodon/actions/accounts';
import {
  replyCompose,
  mentionCompose,
} from 'mastodon/actions/compose';
import {
  reblog,
  favourite,
  unreblog,
  unfavourite,
} from 'mastodon/actions/interactions';
import { openModal } from 'mastodon/actions/modal';
import { initReport } from 'mastodon/actions/reports';
import {
  muteStatus,
  unmuteStatus,
  deleteStatus,
} from 'mastodon/actions/statuses';
import { fetchStatusCard } from 'mastodon/actions/cards';

//  Our imports.
import Status from '.';
import makeStatusSelector from 'glitch/selectors/status';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Localization messages.
const messages = defineMessages({
  blockConfirm  : {
    id             : 'confirmations.block.confirm',
    defaultMessage : 'Block',
  },
  deleteConfirm : {
    id             : 'confirmations.delete.confirm',
    defaultMessage : 'Delete',
  },
  deleteMessage : {
    id             : 'confirmations.delete.message',
    defaultMessage : 'Are you sure you want to delete this status?',
  },
  muteConfirm : {
    id             : 'confirmations.mute.confirm',
    defaultMessage : 'Mute',
  },
});

//  * * * * * * *  //

//  State mapping
//  -------------

//  We wrap our `mapStateToProps()` function in a
//  `makeMapStateToProps()` to give us a closure and preserve
//  `makeGetStatus()`'s value.
const makeMapStateToProps = () => {
  const statusSelector = makeStatusSelector();

  //  State mapping.
  return (state, ownProps) => {
    let status = statusSelector(state, ownProps.id);
    let reblogStatus = status.get('reblog', null);
    let comrade = undefined;
    let prepend = undefined;

    //  Processes reblogs and generates their prepend.
    if (reblogStatus !== null && typeof reblogStatus === 'object') {
      comrade = status.get('account');
      status = reblogStatus;
      prepend = 'reblogged';
    }

    //  This is what we pass to <Status>.
    return {
      autoPlayGif: state.getIn(['meta', 'auto_play_gif']),
      comrade: comrade || ownProps.comrade,
      deleteModal: state.getIn(['meta', 'delete_modal']),
      me: state.getIn(['meta', 'me']),
      prepend: prepend || ownProps.prepend,
      reblogModal: state.getIn(['meta', 'boost_modal']),
      settings: state.get('local_settings'),
      status: status,
    };
  };
};

//  * * * * * * *  //

//  Dispatch mapping
//  ----------------

const makeMapDispatchToProps = (dispatch) => {
  const dispatchSelector = createStructuredSelector({
    handler: ({ intl }) => ({
      block (account) {
        dispatch(openModal('CONFIRM', {
          message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
          confirm: intl.formatMessage(messages.blockConfirm),
          onConfirm: () => dispatch(blockAccount(account.get('id'))),
        }));
      },
      delete (status) {
        if (!this.deleteModal) {  //  TODO: THIS IS BORKN (this refers to handler)
          dispatch(deleteStatus(status.get('id')));
        } else {
          dispatch(openModal('CONFIRM', {
            message: intl.formatMessage(messages.deleteMessage),
            confirm: intl.formatMessage(messages.deleteConfirm),
            onConfirm: () => dispatch(deleteStatus(status.get('id'))),
          }));
        }
      },
      favourite (status) {
        if (status.get('favourited')) {
          dispatch(unfavourite(status));
        } else {
          dispatch(favourite(status));
        }
      },
      fetchCard (status) {
        dispatch(fetchStatusCard(status.get('id')));
      },
      mention (account, router) {
        dispatch(mentionCompose(account, router));
      },
      modalReblog (status) {
        dispatch(reblog(status));
      },
      mute (account) {
        dispatch(openModal('CONFIRM', {
          message: <FormattedMessage id='confirmations.mute.message' defaultMessage='Are you sure you want to mute {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
          confirm: intl.formatMessage(messages.muteConfirm),
          onConfirm: () => dispatch(muteAccount(account.get('id'))),
        }));
      },
      muteConversation (status) {
        if (status.get('muted')) {
          dispatch(unmuteStatus(status.get('id')));
        } else {
          dispatch(muteStatus(status.get('id')));
        }
      },
      openMedia (media, index) {
        dispatch(openModal('MEDIA', { media, index }));
      },
      openVideo (media, time) {
        dispatch(openModal('VIDEO', { media, time }));
      },
      reblog (status, withShift) {
        if (status.get('reblogged')) {
          dispatch(unreblog(status));
        } else {
          if (withShift || !this.reblogModal) {  //  TODO: THIS IS BORKN (this refers to handler)
            this.modalReblog(status);
          } else {
            dispatch(openModal('BOOST', { status, onReblog: this.modalReblog }));
          }
        }
      },
      reply (status, router) {
        dispatch(replyCompose(status, router));
      },
      report (status) {
        dispatch(initReport(status.get('account'), status));
      },
    }),
  });
  return (_, ownProps) => dispatchSelector(ownProps);
};

//  * * * * * * *  //

//  Connecting
//  ----------

//  `connect` will only update when its resultant props change. So
//  `withRouter` won't get called unless an update is already planned.
//  This is intended behaviour because we only care about the (mutable)
//  `history` object.
export default injectIntl(
  connect(makeMapStateToProps, makeMapDispatchToProps)(
    withRouter(Status)
  )
);
