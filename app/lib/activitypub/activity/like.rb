# frozen_string_literal: true

class ActivityPub::Activity::Like < ActivityPub::Activity
  def perform
    original_status = status_from_uri(object_uri)
    return if original_status.nil? || !original_status.account.local? || delete_arrived_first?(@json['id'])

    # misskey delivers reactions as likes and attaches the emoji in _misskey_reaction
    mk_reaction = @json['_misskey_reaction']
    unless mk_reaction.nil?
      custom_emoji = CustomEmoji.find_by(shortcode: mk_reaction, domain: @account.domain)
      return if @account.reacted?(original_status, mk_reaction, custom_emoji)

      reaction = original_status.status_reactions.create!(account: @account, name: mk_reaction, custom_emoji: custom_emoji)
      LocalNotificationWorker.perform_async(original_status.account_id, reaction.id, 'StatusReaction', 'reaction')
      return
    end

    return if @account.favourited?(original_status)

    favourite = original_status.favourites.create!(account: @account)

    LocalNotificationWorker.perform_async(original_status.account_id, favourite.id, 'Favourite', 'favourite')
    Trends.statuses.register(original_status)
  end
end
