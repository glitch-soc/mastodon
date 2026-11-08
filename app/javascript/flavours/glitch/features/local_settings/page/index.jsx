//  Package imports
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';


//  Our imports
import { injectIntl } from '@/flavours/glitch/components/intl';
import { expandSpoilers } from 'flavours/glitch/initial_state';
import { preferenceLink } from 'flavours/glitch/utils/backend_links';

import DeprecatedLocalSettingsPageItem from './deprecated_item';
import LocalSettingsPageItem from './item';

//  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

const messages = defineMessages({
  side_arm_none: { id: 'settings.side_arm.none', defaultMessage: 'None' },
  side_arm_keep: { id: 'settings.side_arm_reply_mode.keep', defaultMessage: 'Keep its set privacy' },
  side_arm_copy: { id: 'settings.side_arm_reply_mode.copy', defaultMessage: 'Copy privacy setting of the toot being replied to' },
  side_arm_restrict: { id: 'settings.side_arm_reply_mode.restrict', defaultMessage: 'Restrict privacy setting to that of the toot being replied to' },
  regexp: { id: 'settings.content_warnings.regexp', defaultMessage: 'Regular expression' },
  rewrite_mentions_no: { id: 'settings.rewrite_mentions_no', defaultMessage: 'Do not rewrite mentions' },
  rewrite_mentions_acct: { id: 'settings.rewrite_mentions_acct', defaultMessage: 'Rewrite with username and domain (when the account is remote)' },
  rewrite_mentions_username: { id: 'settings.rewrite_mentions_username', defaultMessage:  'Rewrite with username' },
  pop_in_left: { id: 'settings.pop_in_left', defaultMessage: 'Left' },
  pop_in_right: { id: 'settings.pop_in_right', defaultMessage:  'Right' },
  public: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted: { id: 'privacy.unlisted.short', defaultMessage: 'Quiet public' },
  private: { id: 'privacy.private.short', defaultMessage: 'Followers' },
  direct: { id: 'privacy.direct.short', defaultMessage: 'Specific people' },
});

class LocalSettingsPage extends PureComponent {

  static propTypes = {
    index    : PropTypes.number,
    intl     : PropTypes.object.isRequired,
    onChange : PropTypes.func.isRequired,
    settings : ImmutablePropTypes.map.isRequired,
  };

  pages = [
    ({ intl, onChange, settings }) => (
      <div className='glitch local-settings__page general'>
        <h1><FormattedMessage id='settings.general' defaultMessage='General' /></h1>
        <LocalSettingsPageItem
          settings={settings}
          item={['confirm_boost_missing_media_description']}
          id='mastodon-settings--confirm_boost_missing_media_description'
          onChange={onChange}
        >
          <FormattedMessage id='settings.confirm_boost_missing_media_description' defaultMessage='Show confirmation dialog before boosting toots lacking media descriptions' />
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['tag_misleading_links']}
          id='mastodon-settings--tag_misleading_links'
          onChange={onChange}
        >
          <FormattedMessage id='settings.tag_misleading_links' defaultMessage='Tag misleading links' />
          <span className='hint'><FormattedMessage id='settings.tag_misleading_links.hint' defaultMessage='Add a visual indication with the link target host to every link not mentioning it explicitly' /></span>
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['rewrite_mentions']}
          id='mastodon-settings--rewrite_mentions'
          options={[
            { value: 'no', message: intl.formatMessage(messages.rewrite_mentions_no) },
            { value: 'acct', message: intl.formatMessage(messages.rewrite_mentions_acct) },
            { value: 'username', message: intl.formatMessage(messages.rewrite_mentions_username) },
          ]}
          onChange={onChange}
        >
          <FormattedMessage id='settings.rewrite_mentions' defaultMessage='Rewrite mentions in displayed statuses' />
        </LocalSettingsPageItem>
        <section>
          <h2><FormattedMessage id='settings.notifications_opts' defaultMessage='Notifications options' /></h2>
          <LocalSettingsPageItem
            settings={settings}
            item={['notifications', 'tab_badge']}
            id='mastodon-settings--notifications-tab_badge'
            onChange={onChange}
          >
            <FormattedMessage id='settings.notifications.tab_badge' defaultMessage='Unread notifications badge' />
            <span className='hint'><FormattedMessage id='settings.notifications.tab_badge.hint' defaultMessage="Display a badge for unread notifications in the column icons when the notifications column isn't open" /></span>
          </LocalSettingsPageItem>
          <LocalSettingsPageItem
            settings={settings}
            item={['notifications', 'favicon_badge']}
            id='mastodon-settings--notifications-favicon_badge'
            onChange={onChange}
          >
            <FormattedMessage id='settings.notifications.favicon_badge' defaultMessage='Unread notifications favicon badge' />
            <span className='hint'><FormattedMessage id='settings.notifications.favicon_badge.hint' defaultMessage='Add a badge for unread notifications to the favicon' /></span>
          </LocalSettingsPageItem>
        </section>
      </div>
    ),
    ({ intl, onChange, settings }) => (
      <div className='glitch local-settings__page compose_box_opts'>
        <h1><FormattedMessage id='settings.compose_box_opts' defaultMessage='Compose box' /></h1>
        <LocalSettingsPageItem
          settings={settings}
          item={['prepend_cw_re']}
          id='mastodon-settings--prepend_cw_re'
          onChange={onChange}
        >
          <FormattedMessage id='settings.prepend_cw_re' defaultMessage='Prepend “re: ” to content warnings when replying' />
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['preselect_on_reply']}
          id='mastodon-settings--preselect_on_reply'
          onChange={onChange}
        >
          <FormattedMessage id='settings.preselect_on_reply' defaultMessage='Pre-select usernames on reply' />
          <span className='hint'><FormattedMessage id='settings.preselect_on_reply_hint' defaultMessage='When replying to a conversation with multiple participants, pre-select usernames past the first' /></span>
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['confirm_before_clearing_draft']}
          id='mastodon-settings--confirm_before_clearing_draft'
          onChange={onChange}
        >
          <FormattedMessage id='settings.confirm_before_clearing_draft' defaultMessage='Show confirmation dialog before overwriting the message being composed' />
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['show_published_toast']}
          id='mastodon-settings--show_published_toast'
          onChange={onChange}
        >
          <FormattedMessage id='settings.show_published_toast' defaultMessage='Display toast when publishing/saving a post' />
        </LocalSettingsPageItem>
      </div>
    ),
    ({ intl, onChange, settings }) => (
      <div className='glitch local-settings__page media'>
        <h1><FormattedMessage id='settings.media' defaultMessage='Media' /></h1>
        <LocalSettingsPageItem
          settings={settings}
          item={['media', 'letterbox']}
          id='mastodon-settings--media-letterbox'
          onChange={onChange}
        >
          <FormattedMessage id='settings.media_letterbox' defaultMessage='Letterbox media' />
          <span className='hint'><FormattedMessage id='settings.media_letterbox_hint' defaultMessage='Scale down and letterbox media to fill the image containers instead of stretching and cropping them' /></span>
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['media', 'fullwidth']}
          id='mastodon-settings--media-fullwidth'
          onChange={onChange}
        >
          <FormattedMessage id='settings.media_fullwidth' defaultMessage='Full-width media previews' />
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['inline_preview_cards']}
          id='mastodon-settings--inline-preview-cards'
          onChange={onChange}
        >
          <FormattedMessage id='settings.inline_preview_cards' defaultMessage='Inline preview cards for external links' />
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['media', 'reveal_behind_cw']}
          id='mastodon-settings--reveal-behind-cw'
          onChange={onChange}
        >
          <FormattedMessage id='settings.media_reveal_behind_cw' defaultMessage='Reveal sensitive media behind a CW by default' />
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['media', 'pop_in_player']}
          id='mastodon-settings--pop-in-player'
          onChange={onChange}
        >
          <FormattedMessage id='settings.pop_in_player' defaultMessage='Enable pop-in player' />
        </LocalSettingsPageItem>
        <LocalSettingsPageItem
          settings={settings}
          item={['media', 'pop_in_position']}
          id='mastodon-settings--pop-in-position'
          options={[
            { value: 'left', message: intl.formatMessage(messages.pop_in_left) },
            { value: 'right', message: intl.formatMessage(messages.pop_in_right) },
          ]}
          onChange={onChange}
          dependsOn={[['media', 'pop_in_player']]}
        >
          <FormattedMessage id='settings.pop_in_position' defaultMessage='Pop-in player position:' />
        </LocalSettingsPageItem>
      </div>
    ),
  ];

  render () {
    const { pages } = this;
    const { index, intl, onChange, settings } = this.props;
    const CurrentPage = pages[index] || pages[0];

    return <CurrentPage intl={intl} onChange={onChange} settings={settings} />;
  }

}

export default injectIntl(LocalSettingsPage);
