import ImmutablePureComponent from 'react-immutable-pure-component';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { autoPlayGif, reduceMotion } from '../initial_state';
import spring from 'react-motion/lib/spring';
import TransitionMotion from 'react-motion/lib/TransitionMotion';
import classNames from 'classnames';
import React from 'react';
import unicodeMapping from '../features/emoji/emoji_unicode_mapping_light';
import AnimatedNumber from './animated_number';
import { assetHost } from '../utils/config';

export default class StatusReactions extends ImmutablePureComponent {

  static propTypes = {
    statusId: PropTypes.string.isRequired,
    reactions: ImmutablePropTypes.list.isRequired,
    numVisible: PropTypes.number,
    addReaction: PropTypes.func.isRequired,
    removeReaction: PropTypes.func.isRequired,
  };

  willEnter() {
    return { scale: reduceMotion ? 1 : 0 };
  }

  willLeave() {
    return { scale: reduceMotion ? 0 : spring(0, { stiffness: 170, damping: 26 }) };
  }

  render() {
    const { reactions, numVisible } = this.props;
    let visibleReactions = reactions
      .filter(x => x.get('count') > 0)
      .sort((a, b) => b.get('count') - a.get('count'));

    if (numVisible >= 0) {
      visibleReactions = visibleReactions.filter((_, i) => i < numVisible);
    }

    const styles = visibleReactions.map(reaction => ({
      key: reaction.get('name'),
      data: reaction,
      style: { scale: reduceMotion ? 1 : spring(1, { stiffness: 150, damping: 13 }) },
    })).toArray();

    return (
      <TransitionMotion styles={styles} willEnter={this.willEnter} willLeave={this.willLeave}>
        {items => (
          <div className={classNames('reactions-bar', { 'reactions-bar--empty': visibleReactions.isEmpty() })}>
            {items.map(({ key, data, style }) => (
              <Reaction
                key={key}
                statusId={this.props.statusId}
                reaction={data}
                style={{ transform: `scale(${style.scale})`, position: style.scale < 0.5 ? 'absolute' : 'static' }}
                addReaction={this.props.addReaction}
                removeReaction={this.props.removeReaction}
              />
            ))}
          </div>
        )}
      </TransitionMotion>
    );
  }

}

class Reaction extends ImmutablePureComponent {

  static propTypes = {
    statusId: PropTypes.string,
    reaction: ImmutablePropTypes.map.isRequired,
    addReaction: PropTypes.func.isRequired,
    removeReaction: PropTypes.func.isRequired,
    style: PropTypes.object,
  };

  state = {
    hovered: false,
  };

  handleClick = () => {
    const { reaction, statusId, addReaction, removeReaction } = this.props;

    if (!reaction.get('extern')) {
      if (reaction.get('me')) {
        removeReaction(statusId, reaction.get('name'));
      } else {
        addReaction(statusId, reaction.get('name'));
      }
    }
  }

  handleMouseEnter = () => this.setState({ hovered: true })

  handleMouseLeave = () => this.setState({ hovered: false })

  render() {
    const { reaction } = this.props;

    return (
      <button
        className={classNames('reactions-bar__item', { active: reaction.get('me') })}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        style={this.props.style}
      >
        <span className='reactions-bar__item__emoji'>
          <Emoji
            hovered={this.state.hovered}
            emoji={reaction.get('name')}
            url={reaction.get('url')}
            staticUrl={reaction.get('static_url')}
          />
        </span>
        <span className='reactions-bar__item__count'>
          <AnimatedNumber value={reaction.get('count')} />
        </span>
      </button>
    );
  }

}

class Emoji extends React.PureComponent {

  static propTypes = {
    emoji: PropTypes.string.isRequired,
    hovered: PropTypes.bool.isRequired,
    url: PropTypes.string,
    staticUrl: PropTypes.string,
  };

  render() {
    const { emoji, hovered, url, staticUrl } = this.props;

    if (unicodeMapping[emoji]) {
      const { filename, shortCode } = unicodeMapping[this.props.emoji];
      const title = shortCode ? `:${shortCode}:` : '';

      return (
        <img
          draggable='false'
          className='emojione'
          alt={emoji}
          title={title}
          src={`${assetHost}/emoji/${filename}.svg`}
        />
      );
    } else {
      const filename = (autoPlayGif || hovered) ? url : staticUrl;
      const shortCode = `:${emoji}:`;

      return (
        <img
          draggable='false'
          className='emojione custom-emoji'
          alt={shortCode}
          title={shortCode}
          src={filename}
        />
      );
    }
  }

}
