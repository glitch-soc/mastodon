//  <StatusContentGalleryPlayer>
//  ==============

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/content/gallery/player

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

//  Mastodon imports.
import { isIOS } from 'mastodon/is_mobile';

//  Our imports.
import CommonButton from 'glitch/components/common/button';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Holds our localization messages.
const messages = defineMessages({
  mute: { id: 'video_player.toggle_sound', defaultMessage: 'Toggle sound' },
  open: { id: 'video_player.open', defaultMessage: 'Open video' },
  play: { id: 'video_player.play', defaultMessage: 'Play video' },
  pause: { id: 'video_player.pause', defaultMessage: 'Pause video' },
  expand: { id: 'video_player.expand', defaultMessage: 'Expand video' },
});

//  * * * * * * *  //

//  The component
//  -------------

export default class StatusContentGalleryPlayer extends ImmutablePureComponent {

  //  Props and state.
  static propTypes = {
    attachment: ImmutablePropTypes.map.isRequired,
    autoPlayGif: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    letterbox: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  }
  state = {
    hasAudio: true,
    muted: true,
    preview: !isIOS() && this.props.autoPlayGif,
    videoError: false,
  }

  //  Basic video controls.
  handleMute = () => {
    this.setState({ muted: !this.state.muted });
  }
  handlePlayPause = () => {
    const { video } = this;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  //  When clicking we either open (de-preview) the video or we
  //  expand it, depending. Note that when we de-preview the video will
  //  also begin playing (except on iOS) due to its `autoplay`
  //  attribute.
  handleClick = () => {
    const { setState, video } = this;
    const { onClick } = this.props;
    const { preview } = this.state;
    if (preview) setState({ preview: false });
    else {
      video.pause();
      onClick(video.currentTime);
    }
  }

  //  Loading and errors. We have to do some hacks in order to check if
  //  the video has audio imo. There's probably a better way to do this
  //  but that's how upstream has it.
  handleLoadedData = () => {
    const { video } = this;
    if (('WebkitAppearance' in document.documentElement.style && video.audioTracks.length === 0) || video.mozHasAudio === false) {
      this.setState({ hasAudio: false });
    }
  }
  handleVideoError = () => {
    this.setState({ videoError: true });
  }

  //  On mounting or update, we ensure our video has the needed event
  //  listeners. We can't necessarily do this right away because there
  //  might be a preview up.
  componentDidMount () {
    this.componentDidUpdate();
  }
  componentDidUpdate () {
    const { handleLoadedData, handleVideoError, video } = this;
    if (!video) return;
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleVideoError);
  }

  //  On unmounting, we remove the listeners from the video element.
  componentWillUnmount () {
    const { handleLoadedData, handleVideoError, video } = this;
    if (!video) return;
    video.removeEventListener('loadeddata', handleLoadedData);
    video.removeEventListener('error', handleVideoError);
  }

  //  Getting a reference to our video.
  setRef = (c) => {
    this.video = c;
  }

  //  Rendering.
  render () {
    const {
      handleClick,
      handleMute,
      handlePlayPause,
      setRef,
      video,
    } = this;
    const {
      attachment,
      letterbox,
      intl,
    } = this.props;
    const {
      hasAudio,
      muted,
      preview,
      videoError,
    } = this.state;
    const originalUrl = attachment.get('url');
    const previewUrl = attachment.get('preview_url');
    const remoteUrl = attachment.get('remote_url');
    let content = null;
    const computedClass = classNames('glitch', 'glitch__status__content__gallery__player', {
      _letterbox: letterbox,
    });

    //  This gets our content: either a preview image, an error
    //  message, or the video.
    switch (true) {
    case preview:
      content = (
        <img
          alt=''
          className='player\preview'
          src={previewUrl}
        />
      );
      break;
    case videoError:
      content = (
        <span className='player\error'>
          <FormattedMessage id='video_player.video_error' defaultMessage='Video could not be played' />
        </span>
      );
      break;
    default:
      content = (
        <video
          autoPlay={!isIOS()}
          className='player\video'
          loop
          muted={muted}
          poster={previewUrl}
          ref={setRef}
          src={originalUrl}
        />
      );
      break;
    }

    //  Everything goes inside of a button because everything is a
    //  button. This is okay wrt the video element because it doesn't
    //  have controls.
    return (
      <div className={computedClass}>
        <CommonButton
          className='player\box'
          href={remoteUrl || originalUrl}
          key='box'
          onClick={handleClick}
          title={intl.formatMessage(preview ? messages.open : messages.expand)}
        >{content}</CommonButton>
        {!preview ? (
          <CommonButton
            active={!video.paused}
            className='player\play-pause player\button'
            icon={video.paused ? 'play' : 'pause'}
            key='play'
            onClick={handlePlayPause}
            title={intl.formatMessage(messages.play)}
          />
        ) : null}
        {!preview && hasAudio ? (
          <CommonButton
            active={!muted}
            className='player\mute player\button'
            icon={muted ? 'volume-off' : 'volume-up'}
            key='mute'
            onClick={handleMute}
            title={intl.formatMessage(messages.mute)}
          />
        ) : null}
      </div>
    );
  }

}
