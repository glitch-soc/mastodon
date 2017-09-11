//  <StatusContentGalleryItem>
//  ==============

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/content/gallery/item

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
import { defineMessages } from 'react-intl';

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
  expand: { id: 'media_gallery.expand', defaultMessage: 'Expand image' },
});

//  * * * * * * *  //

//  The component
//  -------------

export default class StatusContentGalleryItem extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    attachment: ImmutablePropTypes.map.isRequired,
    autoPlayGif: PropTypes.bool,
    gallerySize: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    intl: PropTypes.object.isRequired,
    letterbox: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  };

  //  Click handling.
  handleClick = this.props.onClick.bind(this, this.props.index);

  //  Item rendering.
  render () {
    const { handleClick } = this;
    const {
      attachment,
      autoPlayGif,
      gallerySize,
      intl,
      letterbox,
    } = this.props;
    const originalUrl = attachment.get('url');
    const previewUrl = attachment.get('preview_url');
    const remoteUrl = attachment.get('remote_url');
    let thumbnail = '';
    const computedClass = classNames('glitch', 'glitch__status__content__gallery__item', {
      _letterbox: letterbox,
    });

    //  If our gallery has more than one item, our images only take up
    //  half the width. We need this for image `sizes` calculations.
    let multiplier = gallerySize === 1 ? 1 : .5;

    //  Image attachments
    if (attachment.get('type') === 'image') {
      const previewWidth = attachment.getIn(['meta', 'small', 'width']);
      const originalWidth = attachment.getIn(['meta', 'original', 'width']);

      //  This lets the browser conditionally select the preview or
      //  original image depending on what the rendered size ends up
      //  being. We, of course, have no way of knowing what the width
      //  of the gallery will be post–CSS, but we conservatively roll
      //  with 400px. (Note: Upstream Mastodon used media queries here,
      //  but because our page layout is user-configurable, we don't
      //  bother.)
      const srcSet = `${originalUrl} ${originalWidth}w, ${previewUrl} ${previewWidth}w`;
      const sizes = `${(400 * multiplier) >> 0}px`;

      //  The image.
      thumbnail = (
        <img
          alt=''
          className='item\image'
          sizes={sizes}
          src={previewUrl}
          srcSet={srcSet}
        />
      );

    //  Gifv attachments.
    } else if (attachment.get('type') === 'gifv') {
      const autoPlay = !isIOS() && autoPlayGif;
      thumbnail = (
        <video
          autoPlay={autoPlay}
          className='item\gifv'
          loop
          muted
          poster={previewUrl}
          src={originalUrl}
        />
      );
    }

    //  Rendering. We render the item inside of a button+link, which
    //  provides the original. (We can do this for gifvs because we
    //  don't show the controls.)
    return (
      <CommonButton
        className={computedClass}
        data-gallery-size={gallerySize}
        href={remoteUrl || originalUrl}
        key={attachment.get('id')}
        onClick={handleClick}
        title={intl.formatMessage(messages.expand)}
      >{thumbnail}</CommonButton>
    );
  }

}
