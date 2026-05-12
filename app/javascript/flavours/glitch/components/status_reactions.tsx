import { useCallback, useMemo } from 'react';
import type { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import type { AnimatedProps } from '@react-spring/web';
import { animated, useTransition } from '@react-spring/web';

import {
  addReaction,
  removeReaction,
} from '@/flavours/glitch/actions/interactions';
import { AnimatedNumber } from '@/flavours/glitch/components/animated_number';
import { Emoji } from '@/flavours/glitch/components/emoji';
import { isUnicodeEmoji } from '@/flavours/glitch/features/emoji/utils';
import { useCustomEmojis } from '@/flavours/glitch/hooks/useCustomEmojis';
import { useIdentity } from '@/flavours/glitch/identity_context';
import {
  reduceMotion,
  visibleReactions as visible,
} from '@/flavours/glitch/initial_state';
import type { StatusReactionMap } from '@/flavours/glitch/models/reaction';
import { useAppDispatch } from '@/flavours/glitch/store';

export const StatusReactions: FC<{
  reactions: StatusReactionMap[];
  id: string;
}> = ({ reactions, id }) => {
  const numVisible = visible ?? 6;
  const visibleReactions = useMemo(() => {
    let visible = reactions
      .filter((x) => (x.get('count') as number) > 0)
      .sort((a, b) => (b.get('count') as number) - (a.get('count') as number));

    if (numVisible >= 0) {
      visible = visible.filter((_, i) => i < numVisible);
    }

    return visible;
  }, [numVisible, reactions]);

  const transitions = useTransition(visibleReactions, {
    from: {
      scale: 0,
    },
    initial: {
      scale: 1,
    },
    enter: {
      scale: 1,
    },
    leave: {
      scale: 0,
    },
    immediate: reduceMotion,
    keys: visibleReactions.map((x) => x.get('name') as string),
  });

  return (
    <div
      className={classNames('reactions-bar', {
        'reactions-bar--empty': visibleReactions.length === 0,
      })}
    >
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.get('name') as string}
          reaction={reaction}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          id={id}
        />
      ))}
    </div>
  );
};

const Reaction: FC<{
  reaction: StatusReactionMap;
  id: string;
  style: AnimatedProps<HTMLAttributes<HTMLButtonElement>>['style'];
}> = ({ id, reaction, style }) => {
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();
  const customEmoji = useCustomEmojis();
  const handleClick = useCallback(() => {
    if (!signedIn) return;
    if (reaction.get('me')) {
      dispatch(removeReaction(id, reaction.get('name')));
    } else {
      dispatch(addReaction(id, reaction.get('name')));
    }
  }, [dispatch, signedIn, id, reaction]);

  const code = isUnicodeEmoji(reaction.get('name') as string)
    ? (reaction.get('name') as string)
    : `:${reaction.get('name') as string}:`;

  return (
    <animated.button
      className={classNames('reactions-bar__item', {
        active: reaction.get('me'),
      })}
      onClick={handleClick}
      style={style}
    >
      <span className='reactions-bar__item__emoji'>
        <Emoji code={code} customEmoji={customEmoji} />
      </span>
      <span className='reactions-bar__item__count'>
        <AnimatedNumber value={reaction.get('count') as number} />
      </span>
    </animated.button>
  );
};
