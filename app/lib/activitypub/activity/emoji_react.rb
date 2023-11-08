# frozen_string_literal: true

class ActivityPub::Activity::EmojiReact < ActivityPub::Activity
  def perform
    original_status = status_from_uri(object_uri)
    name = @json['content']
    return if original_status.nil? ||
              !original_status.account.local? ||
              delete_arrived_first?(@json['id'])

    if /^:.*:$/.match?(name)
      name.delete! ':'
      custom_emoji = process_emoji_tags(name, @json['tag'])

      return if custom_emoji.nil?
    end

    return if @account.reacted?(original_status, name, custom_emoji)

    reaction = original_status.status_reactions.create!(account: @account, name: name, custom_emoji: custom_emoji)

    LocalNotificationWorker.perform_async(original_status.account_id, reaction.id, 'StatusReaction', 'reaction')
  rescue ActiveRecord::RecordInvalid
    nil
  end
end
