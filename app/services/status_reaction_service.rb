# frozen_string_literal: true

class StatusReactionService < BaseService
  include Authorization
  include Payloadable

  def call(account, status, emoji)
    name, domain = emoji.split('@')
    custom_emoji = CustomEmoji.find_by(shortcode: name, domain: domain)
    reaction = StatusReaction.find_by(account: account, status: status, name: name, custom_emoji: custom_emoji)
    return reaction unless reaction.nil?

    reaction = StatusReaction.create!(account: account, status: status, name: name, custom_emoji: custom_emoji)

    json = Oj.dump(serialize_payload(reaction, ActivityPub::EmojiReactionSerializer))
    if status.account.local?
      NotifyService.new.call(status.account, :reaction, reaction)
      ActivityPub::RawDistributionWorker.perform_async(json, status.account.id)
    else
      ActivityPub::DeliveryWorker.perform_async(json, reaction.account_id, status.account.inbox_url)
    end

    ActivityTracker.increment('activity:interactions')

    reaction
  end
end
