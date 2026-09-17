# frozen_string_literal: true

class UnreactWorker
  include Sidekiq::Worker

  def perform(account_id, status_id, emoji)
    UnreactService.new.call(Account.find(account_id), Status.find(status_id), emoji)
  rescue ActiveRecord::RecordNotFound
    true
  end
end
