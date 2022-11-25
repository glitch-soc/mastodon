import { createSelector } from 'reselect';
import { Map as ImmutableMap } from 'immutable';

const buildCustomEmojiMap = createSelector(
  [state => state.get('custom_emojis')],
  items => items.reduce(
    (map, emoji) => map.set(emoji.get('shortcode'), emoji),
    ImmutableMap(),
  ),
);
export default buildCustomEmojiMap;
