# frozen_string_literal: true

class UnreactService < BaseService
  include Payloadable

  def call(account, status, name)
    reaction = StatusReaction.find_by(account: account, status: status, name: name)
    return if reaction.nil?

    reaction.destroy!

    json = Oj.dump(serialize_payload(reaction, ActivityPub::UndoEmojiReactionSerializer))
    if status.account.local?
      ActivityPub::RawDistributionWorker.perform_async(json, status.account.id)
    else
      ActivityPub::DeliveryWorker.perform_async(json, reaction.account_id, status.account.inbox_url)
    end

    reaction
  end
end
