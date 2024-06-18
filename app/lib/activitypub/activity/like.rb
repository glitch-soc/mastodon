# frozen_string_literal: true

class ActivityPub::Activity::Like < ActivityPub::Activity
  CUSTOM_EMOJI_REGEX = /^:[^:]+:$/

  def perform
    original_status = status_from_uri(object_uri)
    return if original_status.nil? || !original_status.account.local? || delete_arrived_first?(@json['id'])

    return if maybe_process_embedded_reaction

    return if @account.favourited?(original_status)

    favourite = original_status.favourites.create!(account: @account)

    LocalNotificationWorker.perform_async(original_status.account_id, favourite.id, 'Favourite', 'favourite')
    Trends.statuses.register(original_status)
  end

  # Some servers deliver reactions as likes with the emoji in content
  # Versions of Misskey before 12.1.0 specify emojis in _misskey_reaction instead, so we check both
  # See https://misskey-hub.net/ns.html#misskey-reaction for details
  def maybe_process_embedded_reaction
    original_status = status_from_uri(object_uri)
    name = @json['content'] || @json['_misskey_reaction']
    return false if name.nil?

    if CUSTOM_EMOJI_REGEX.match?(name)
      name.delete! ':'
      custom_emoji = process_emoji_tags(name, @json['tag'])

      return false if custom_emoji.nil? # invalid custom emoji, treat it as a regular like
    end
    return true if @account.reacted?(original_status, name, custom_emoji)

    reaction = original_status.status_reactions.create!(account: @account, name: name, custom_emoji: custom_emoji)
    LocalNotificationWorker.perform_async(original_status.account_id, reaction.id, 'StatusReaction', 'reaction')
    true
  # account tried to react with disabled custom emoji. Returning true to discard activity.
  rescue ActiveRecord::RecordInvalid
    true
  end
end
