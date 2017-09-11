//  <StatusContentGallery>
//  ======================

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/content/gallery

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports:
//  --------

//  Package imports.
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { defineMessages, FormattedMessage } from 'react-intl';

//  Our imports.
import StatusContentGalleryItem from './item';
import StatusContentGalleryPlayer from './player';
import CommonButton from 'glitch/components/common/button';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Holds our localization messages.
const messages = defineMessages({
  hide: { id: 'media_gallery.hide_media', defaultMessage: 'Hide media' },
});

//  * * * * * * *  //

//  The component
//  -------------

export default class StatusContentGallery extends ImmutablePureComponent {

  //  Props and state.
  static propTypes = {
    attachments: ImmutablePropTypes.list.isRequired,
    autoPlayGif: PropTypes.bool,
    fullwidth: PropTypes.bool,
    height: PropTypes.number.isRequired,
    intl: PropTypes.object.isRequired,
    letterbox: PropTypes.bool,
    onOpenMedia: PropTypes.func.isRequired,
    onOpenVideo: PropTypes.func.isRequired,
    sensitive: PropTypes.bool,
    standalone: PropTypes.bool,
  };
  state = {
    visible: !this.props.sensitive,
  };

  //  Handles media clicks.
  handleMediaClick = index => {
    const { attachments, onOpenMedia, standalone } = this.props;
    if (standalone) return;
    onOpenMedia(attachments, index);
  }

  //  Handles showing and hiding.
  handleToggle = () => {
    this.setState({ visible: !this.state.visible });
  }

  //  Handles video clicks.
  handleVideoClick = time => {
    const { attachments, onOpenVideo, standalone } = this.props;
    if (standalone) return;
    onOpenVideo(attachments.get(0), time);
  }

  //  Renders.
  render () {
    const { handleMediaClick, handleToggle, handleVideoClick } = this;
    const {
      attachments,
      autoPlayGif,
      fullwidth,
      intl,
      letterbox,
      sensitive,
    } = this.props;
    const { visible } = this.state;
    const computedClass = classNames('glitch', 'glitch__status__content__gallery', {
      _fullwidth: fullwidth,
    });
    const useableAttachments = attachments.take(4);
    let button;
    let children;
    let size;

    //  This handles hidden media
    if (!this.state.visible) {
      button = (
        <CommonButton
          active
          className='gallery\sensitive gallery\curtain'
          title={intl.formatMessage(messages.hide)}
          onClick={handleToggle}
        >
          <span className='gallery\message'>
            <strong className='gallery\warning'>
              {sensitive ? (
                <FormattedMessage
                  id='status.sensitive_warning'
                  defaultMessage='Sensitive content'
                />
              ) : (
                <FormattedMessage
                  id='status.media_hidden'
                  defaultMessage='Media hidden'
                />
              )}
            </strong>
            <FormattedMessage
              defaultMessage='Click to view'
              id='status.sensitive_toggle'
            />
          </span>
        </CommonButton>
      );  //  No children with hidden media

    //  If our media is visible, then we render it alongside the
    //  "eyeball" button.
    } else {
      button = (
        <CommonButton
          className='gallery\sensitive gallery\button'
          icon={visible ? 'eye' : 'eye-slash'}
          title={intl.formatMessage(messages.hide)}
          onClick={handleToggle}
        />
      );

      //  If our first item is a video, we render a player. Otherwise,
      //  we render our images.
      if (attachments.getIn([0, 'type']) === 'video') {
        size = 1;
        children = (
          <StatusContentGalleryPlayer
            attachment={attachments.get(0)}
            autoPlayGif={autoPlayGif}
            intl={intl}
            letterbox={letterbox}
            onClick={handleVideoClick}
          />
        );
      } else {
        size = useableAttachments.size;
        children = useableAttachments.map(
          (attachment, index) => (
            <StatusContentGalleryItem
              attachment={attachment}
              autoPlayGif={autoPlayGif}
              gallerySize={size}
              index={index}
              intl={intl}
              key={attachment.get('id')}
              letterbox={letterbox}
              onClick={handleMediaClick}
            />
          )
        );
      }
    }

    //  Renders the gallery.
    return (
      <div
        className={computedClass}
        style={{ height: `${this.props.height}px` }}
      >
        {button}
        {children}
      </div>
    );
  }

}
