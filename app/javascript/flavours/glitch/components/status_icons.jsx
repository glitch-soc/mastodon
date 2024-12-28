//  Package imports.
import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';

import ForumIcon from '@/material-icons/400-24px/forum.svg?react';
import HomeIcon from '@/material-icons/400-24px/home.svg?react';
import { Icon } from 'flavours/glitch/components/icon';
import { MediaIcon } from 'flavours/glitch/components/media_icon';
import { languages } from 'flavours/glitch/initial_state';

import { VisibilityIcon } from './visibility_icon';

const messages = defineMessages({
  inReplyTo: { id: 'status.in_reply_to', defaultMessage: 'This toot is a reply' },
  localOnly: { id: 'status.local_only', defaultMessage: 'Only visible from your instance' },
});

const LanguageIcon = ({ language }) => {
  if (!languages) return null;

  const lang = languages.find((lang) => lang[0] === language);
  if (!lang) return null;

  return (
    <span className='text-icon' title={`${lang[2]} (${lang[1]})`} aria-hidden='true'>
      {lang[0].toUpperCase()}
    </span>
  );
};

LanguageIcon.propTypes = {
  language: PropTypes.string.isRequired,
};

class StatusIcons extends PureComponent {

  static propTypes = {
    status: ImmutablePropTypes.map.isRequired,
    mediaIcons: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object.isRequired,
    settings: ImmutablePropTypes.map.isRequired,
  };

  render () {
    const {
      status,
      mediaIcons,
      settings,
      intl,
    } = this.props;

    return (
      <div className='status__info__icons'>
        {settings.get('language') && status.get('language') && <LanguageIcon language={status.get('language')} />}
        {settings.get('reply') && status.get('in_reply_to_id', null) !== null ? (
          <Icon
            className='status__reply-icon'
            id='comment'
            icon={ForumIcon}
            aria-hidden='true'
            title={intl.formatMessage(messages.inReplyTo)}
          />
        ) : null}
        {settings.get('local_only') && status.get('local_only') &&
          <Icon
            id='home'
            icon={HomeIcon}
            aria-hidden='true'
            title={intl.formatMessage(messages.localOnly)}
          />}
        {settings.get('media') && !!mediaIcons && mediaIcons.map(icon => (<MediaIcon key={`media-icon--${icon}`} className='status__media-icon' icon={icon} />))}
        {settings.get('visibility') && <VisibilityIcon visibility={status.get('visibility')} />}
      </div>
    );
  }

}

export default injectIntl(StatusIcons);
