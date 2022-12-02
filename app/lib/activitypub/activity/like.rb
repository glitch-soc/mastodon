# frozen_string_literal: true

class ActivityPub::Activity::Like < ActivityPub::Activity
  def perform
    original_status = status_from_uri(object_uri)
    return if original_status.nil? || !original_status.account.local? || delete_arrived_first?(@json['id'])

    return if maybe_process_misskey_reaction(original_status)

    return if @account.favourited?(original_status)

    favourite = original_status.favourites.create!(account: @account)

    LocalNotificationWorker.perform_async(original_status.account_id, favourite.id, 'Favourite', 'favourite')
    Trends.statuses.register(original_status)
  end

  # Misskey delivers reactions as likes with the emoji in _misskey_reaction
  # see https://misskey-hub.net/ns.html#misskey-reaction for details
  def maybe_process_misskey_reaction(original_status)
    name = @json['_misskey_reaction']
    return false if name.nil?

    custom_emoji = nil
    if name =~ /^:.*:$/
      process_emoji_tags

      name.delete! ':'
      custom_emoji = CustomEmoji.find_by(shortcode: name, domain: @account.domain)
      return false if custom_emoji.nil? # invalid custom emoji, treat it as a regular like
    end
    return true if @account.reacted?(original_status, name, custom_emoji)

    reaction = original_status.status_reactions.create!(account: @account, name: name, custom_emoji: custom_emoji)
    LocalNotificationWorker.perform_async(original_status.account_id, reaction.id, 'StatusReaction', 'reaction')
    return true
  end
end
