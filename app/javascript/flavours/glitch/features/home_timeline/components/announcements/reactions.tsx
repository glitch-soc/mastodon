import { useCallback, useMemo } from 'react';
import type { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import type { AnimatedProps } from '@react-spring/web';
import { animated, useTransition } from '@react-spring/web';

import {
  addReaction,
  removeReaction,
} from '@/flavours/glitch/actions/announcements';
import type { ApiAnnouncementReactionJSON } from '@/flavours/glitch/api_types/announcements';
import { AnimatedNumber } from '@/flavours/glitch/components/animated_number';
import { Emoji } from '@/flavours/glitch/components/emoji';
import { Icon } from '@/flavours/glitch/components/icon';
import EmojiPickerDropdown from '@/flavours/glitch/features/compose/containers/emoji_picker_dropdown_container';
import { isUnicodeEmoji } from '@/flavours/glitch/features/emoji/utils';
import { useAppDispatch } from '@/flavours/glitch/store';
import AddIcon from '@/material-icons/400-24px/add.svg?react';

export const ReactionsBar: FC<{
  reactions: ApiAnnouncementReactionJSON[];
  id: string;
}> = ({ reactions, id }) => {
  const visibleReactions = useMemo(
    () => reactions.filter((x) => x.count > 0),
    [reactions],
  );

  const dispatch = useAppDispatch();
  const handleEmojiPick = useCallback(
    (emoji: { native: string }) => {
      dispatch(addReaction(id, emoji.native.replaceAll(/:/g, '')));
    },
    [dispatch, id],
  );

  const transitions = useTransition(visibleReactions, {
    from: {
      scale: 0,
    },
    enter: {
      scale: 1,
    },
    leave: {
      scale: 0,
    },
    keys: visibleReactions.map((x) => x.name),
  });

  return (
    <div
      className={classNames('reactions-bar', {
        'reactions-bar--empty': visibleReactions.length === 0,
      })}
    >
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.name}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          id={id}
        />
      ))}

      {visibleReactions.length < 8 && (
        <EmojiPickerDropdown
          onPickEmoji={handleEmojiPick}
          button={<Icon id='plus' icon={AddIcon} />}
        />
      )}
    </div>
  );
};

const Reaction: FC<{
  reaction: ApiAnnouncementReactionJSON;
  id: string;
  style: AnimatedProps<HTMLAttributes<HTMLButtonElement>>['style'];
}> = ({ id, reaction, style }) => {
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    if (reaction.me) {
      dispatch(removeReaction(id, reaction.name));
    } else {
      dispatch(addReaction(id, reaction.name));
    }
  }, [dispatch, id, reaction.me, reaction.name]);

  const code = isUnicodeEmoji(reaction.name)
    ? reaction.name
    : `:${reaction.name}:`;

  return (
    <animated.button
      className={classNames('reactions-bar__item', {
        active: reaction.me,
      })}
      onClick={handleClick}
      style={style}
    >
      <span className='reactions-bar__item__emoji'>
        <Emoji code={code} />
      </span>
      <span className='reactions-bar__item__count'>
        <AnimatedNumber value={reaction.count} />
      </span>
    </animated.button>
  );
};
