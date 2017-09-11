//  <StatusActionBar>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/action_bar

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { defineMessages } from 'react-intl';

//  Mastodon imports.
import DropdownMenuContainer from 'mastodon/containers/dropdown_menu_container';

//  Our imports.
import CommonButton from 'glitch/components/common/button';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Holds our localization messages.
const messages = defineMessages({
  delete:
    { id: 'status.delete', defaultMessage: 'Delete' },
  mention:
    { id: 'status.mention', defaultMessage: 'Mention @{name}' },
  mute:
    { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  block:
    { id: 'account.block', defaultMessage: 'Block @{name}' },
  reply:
    { id: 'status.reply', defaultMessage: 'Reply' },
  replyAll:
    { id: 'status.replyAll', defaultMessage: 'Reply to thread' },
  reblog:
    { id: 'status.reblog', defaultMessage: 'Boost' },
  cannot_reblog:
    { id: 'status.cannot_reblog', defaultMessage: 'This post cannot be boosted' },
  favourite:
    { id: 'status.favourite', defaultMessage: 'Favourite' },
  open:
    { id: 'status.open', defaultMessage: 'Expand this status' },
  report:
    { id: 'status.report', defaultMessage: 'Report @{name}' },
  muteConversation:
    { id: 'status.mute_conversation', defaultMessage: 'Mute conversation' },
  unmuteConversation:
    { id: 'status.unmute_conversation', defaultMessage: 'Unmute conversation' },
  share:
    { id: 'status.share', defaultMessage: 'Share' },
  more:
    { id: 'status.more', defaultMessage: 'More' },
});

//  * * * * * * *  //

//  The component
//  -------------

export default class StatusActionBar extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    detailed: PropTypes.bool,
    handler: PropTypes.objectOf(PropTypes.func).isRequired,
    history: PropTypes.object,
    intl: PropTypes.object.isRequired,
    me: PropTypes.number,
    status: ImmutablePropTypes.map.isRequired,
  };

  //  These handle all of our actions.
  handleReplyClick = () => {
    const { handler, history, status } = this.props;
    handler.reply(status, { history });  //  hack
  }
  handleFavouriteClick = () => {
    const { handler, status } = this.props;
    handler.favourite(status);
  }
  handleReblogClick = (e) => {
    const { handler, status } = this.props;
    handler.reblog(status, e.shiftKey);
  }
  handleDeleteClick = () => {
    const { handler, status } = this.props;
    handler.delete(status);
  }
  handleMentionClick = () => {
    const { handler, history, status } = this.props;
    handler.mention(status.get('account'), { history });  //  hack
  }
  handleMuteClick = () => {
    const { handler, status } = this.props;
    handler.mute(status.get('account'));
  }
  handleBlockClick = () => {
    const { handler, status } = this.props;
    handler.block(status.get('account'));
  }
  handleOpen = () => {
    const { history, status } = this.props;
    history.push(`/statuses/${status.get('id')}`);
  }
  handleReport = () => {
    const { handler, status } = this.props;
    handler.report(status);
  }
  handleShare = () => {
    const { status } = this.props;
    navigator.share({
      text: status.get('search_index'),
      url: status.get('url'),
    });
  }
  handleConversationMuteClick = () => {
    const { handler, status } = this.props;
    handler.muteConversation(status);
  }

  //  Renders our component.
  render () {
    const {
      handleBlockClick,
      handleConversationMuteClick,
      handleDeleteClick,
      handleFavouriteClick,
      handleMentionClick,
      handleMuteClick,
      handleOpen,
      handleReblogClick,
      handleReplyClick,
      handleReport,
      handleShare,
    } = this;
    const { detailed, intl, me, status } = this.props;
    const account = status.get('account');
    const reblogDisabled = status.get('visibility') === 'private' || status.get('visibility') === 'direct';
    const reblogTitle = reblogDisabled ? intl.formatMessage(messages.cannot_reblog) : intl.formatMessage(messages.reblog);
    const mutingConversation = status.get('muted');
    const anonymousAccess = !me;
    let menu = [];
    let replyIcon;
    let replyTitle;

    //  This builds our menu.
    if (!detailed) {
      menu.push({
        text: intl.formatMessage(messages.open),
        action: handleOpen,
      });
      menu.push(null);
    }
    menu.push({
      text: intl.formatMessage(mutingConversation ? messages.unmuteConversation : messages.muteConversation),
      action: handleConversationMuteClick,
    });
    menu.push(null);
    if (account.get('id') === me) {
      menu.push({
        text: intl.formatMessage(messages.delete),
        action: handleDeleteClick,
      });
    } else {
      menu.push({
        text: intl.formatMessage(messages.mention, {
          name: account.get('username'),
        }),
        action: handleMentionClick,
      });
      menu.push(null);
      menu.push({
        text: intl.formatMessage(messages.mute, {
          name: account.get('username'),
        }),
        action: handleMuteClick,
      });
      menu.push({
        text: intl.formatMessage(messages.block, {
          name: account.get('username'),
        }),
        action: handleBlockClick,
      });
      menu.push({
        text: intl.formatMessage(messages.report, {
          name: account.get('username'),
        }),
        action: handleReport,
      });
    }

    //  This selects our reply icon.
    if (status.get('in_reply_to_id', null) === null) {
      replyIcon = 'reply';
      replyTitle = intl.formatMessage(messages.reply);
    } else {
      replyIcon = 'reply-all';
      replyTitle = intl.formatMessage(messages.replyAll);
    }

    //  Now we can render the component.
    return (
      <div className='glitch glitch__status__action-bar'>
        <CommonButton
          className='action-bar\button'
          disabled={anonymousAccess}
          title={replyTitle}
          icon={replyIcon}
          onClick={handleReplyClick}
        />
        <CommonButton
          className='action-bar\button'
          disabled={anonymousAccess || reblogDisabled}
          active={status.get('reblogged')}
          title={reblogTitle}
          icon='retweet'
          onClick={handleReblogClick}
        />
        <CommonButton
          className='action-bar\button'
          disabled={anonymousAccess}
          animate
          active={status.get('favourited')}
          title={intl.formatMessage(messages.favourite)}
          icon='star'
          onClick={handleFavouriteClick}
        />
        {
          'share' in navigator ? (
            <CommonButton
              className='action-bar\button'
              disabled={status.get('visibility') !== 'public'}
              title={intl.formatMessage(messages.share)}
              icon='share-alt'
              onClick={handleShare}
            />
          ) : null
        }
        <div className='action-bar\button'>
          <DropdownMenuContainer
            items={menu}
            disabled={anonymousAccess}
            icon='ellipsis-h'
            size={18}
            direction='right'
            aria-label={intl.formatMessage(messages.more)}
          />
        </div>
      </div>
    );
  }

}
