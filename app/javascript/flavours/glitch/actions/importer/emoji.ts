import type { ApiCustomEmojiJSON } from '@/flavours/glitch/api_types/custom_emoji';
import { loadCustomEmoji } from '@/flavours/glitch/features/emoji';
import { emojiLogger } from '@/flavours/glitch/features/emoji/utils';

const log = emojiLogger('actions');

export async function importCustomEmoji(emojis: ApiCustomEmojiJSON[]) {
  if (emojis.length === 0) {
    return;
  }

  // First, check if we already have them all.
  const { searchCustomEmojisByShortcodes, clearCache } =
    await import('@/flavours/glitch/features/emoji/database');

  const existingEmojis = await searchCustomEmojisByShortcodes(
    emojis.map((emoji) => emoji.shortcode),
  );

  // If there's a mismatch, re-import all custom emojis.
  if (existingEmojis.length > 0 && existingEmojis.length < emojis.length) {
    await clearCache('custom');
    await loadCustomEmoji();

    log('Custom emojis updated, reloaded cache and picker data.');
  }
}
