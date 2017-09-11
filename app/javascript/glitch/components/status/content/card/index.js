//  <StatusContentCard>
//  ========

//  For code documentation, please see:
//  https://glitch-soc.github.io/docs/javascript/glitch/status/content/card

//  For more information, please contact:
//  @kibi@glitch.social

//  * * * * * * *  //

//  Imports
//  -------

//  Package imports.
import classNames from 'classnames';
import PropTypes from 'prop-types';
import punycode from 'punycode';
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

//  Mastodon imports.
import emojify from 'mastodon/emoji';

//  Our imports.
import CommonLink from 'glitch/components/common/link';
import CommonSeparator from 'glitch/components/common/separator';

//  Stylesheet imports.
import './style';

//  * * * * * * *  //

//  Initial setup
//  -------------

//  Reliably gets the hostname from a URL.
const getHostname = url => {
  const parser = document.createElement('a');
  parser.href = url;
  return parser.hostname;
};

//  * * * * * * *  //

//  The component
//  -------------
export default class Card extends ImmutablePureComponent {

  //  Props.
  static propTypes = {
    card: ImmutablePropTypes.map.isRequired,
    fullwidth: PropTypes.bool,
    letterbox: PropTypes.bool,
  }

  //  Rendering.
  render () {
    const { card, fullwidth, letterbox } = this.props;
    let media = null;
    let text = null;
    let author = null;
    let provider = null;
    let caption = null;

    //  This gets all of our card properties.
    const authorName = card.get('author_name');
    const authorUrl = card.get('author_url');
    const description = card.get('description');
    const html = card.get('html');
    const image = card.get('image');
    const providerName = card.get('provider_name');
    const providerUrl = card.get('provider_url');
    const title = card.get('title');
    const type = card.get('type');
    const url = card.get('url');

    //  Sets our class.
    const computedClass = classNames('glitch', 'glitch__status__content__card', type, {
      _fullwidth: fullwidth,
      _letterbox: letterbox,
    });

    //  A card is required to render.
    if (!card) return null;

    //  This generates our card media (image or video).
    switch(type) {
    case 'photo':
      media = (
        <CommonLink
          className='card\media card\photo'
          href={url}
        >
          <img
            alt={title}
            src={image}
          />
        </CommonLink>
      );
      break;
    case 'video':
      media = (
        <div
          className='card\media card\video'
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      break;
    }

    //  If we have at least a title or a description, then we can
    //  render some textual contents.
    if (title || description) {
      text = (
        <CommonLink
          className='card\description'
          href={url}
        >
          {type === 'link' && image ? (
            <div className='card\thumbnail'>
              <img
                alt=''
                className='card\image'
                src={image}
              />
            </div>
          ) : null}
          {title ? (
            <h1 className='card\title'>{title}</h1>
          ) : null}
          {emojify(description)}
        </CommonLink>
      );
    }

    //  This creates links or spans (depending on whether a URL was
    //  provided) for the card author and provider.
    if (authorUrl) {
      author = (
        <CommonLink
          className='card\author card\link'
          href={authorUrl}
        >
          {authorName ? authorName : punycode.toUnicode(getHostname(authorUrl))}
        </CommonLink>
      );
    } else if (authorName) {
      author = <span className='card\author'>{authorName}</span>;
    }
    if (providerUrl) {
      provider = (
        <CommonLink
          className='card\provider card\link'
          href={providerUrl}
        >
          {providerName ? providerName : punycode.toUnicode(getHostname(providerUrl))}
        </CommonLink>
      );
    } else if (providerName) {
      provider = <span className='card\provider'>{providerName}</span>;
    }

    //  If we have either the author or the provider, then we can
    //  render an attachment.
    if (author || provider) {
      caption = (
        <figcaption className='card\caption'>
          {author}
          <CommonSeparator
            className='card\separator'
            visible={author && provider}
          />
          {provider}
        </figcaption>
      );
    }

    //  Putting the pieces together and returning.
    return (
      <figure className={computedClass}>
        {media}
        {text}
        {caption}
      </figure>
    );
  }

}
