# frozen_string_literal: true

class ActivityPub::Activity::EmojiReact < ActivityPub::Activity
  def perform
    original_status = status_from_uri(object_uri)
    name = @json['content']
    return if original_status.nil? ||
              !original_status.account.local? ||
              delete_arrived_first?(@json['id']) ||
              @account.reacted?(original_status, name)

    if name =~ /^:.*:$/
      process_emoji_tags

      name.delete! ':'
      return if CustomEmoji.find_by(shortcode: name, domain: @account.domain).nil?
    end

    reaction = original_status.status_reactions.create!(account: @account, name: name)

    LocalNotificationWorker.perform_async(original_status.account_id, reaction.id, 'StatusReaction', 'reaction')
  end
end
