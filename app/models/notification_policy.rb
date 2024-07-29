# frozen_string_literal: true

# == Schema Information
#
# Table name: notification_policies
#
#  id                      :bigint(8)        not null, primary key
#  account_id              :bigint(8)        not null
#  filter_not_following    :boolean          default(FALSE), not null
#  filter_not_followers    :boolean          default(FALSE), not null
#  filter_new_accounts     :boolean          default(FALSE), not null
#  filter_private_mentions :boolean          default(TRUE), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  mute_not_following      :boolean          default(FALSE), not null
#  mute_not_followers      :boolean          default(FALSE), not null
#  mute_new_accounts       :boolean          default(FALSE), not null
#  mute_private_mentions   :boolean          default(FALSE), not null
#

class NotificationPolicy < ApplicationRecord
  belongs_to :account

  has_many :notification_requests, primary_key: :account_id, foreign_key: :account_id, dependent: nil, inverse_of: false

  attr_reader :pending_requests_count, :pending_notifications_count

  before_update :ensure_filter_mute_exclusivity

  MAX_MEANINGFUL_COUNT = 100

  def summarize!
    @pending_requests_count = pending_notification_requests.first
    @pending_notifications_count = pending_notification_requests.last
  end

  private

  def pending_notification_requests
    @pending_notification_requests ||= notification_requests.limit(MAX_MEANINGFUL_COUNT).pick(Arel.sql('count(*), coalesce(sum(notifications_count), 0)::bigint'))
  end

  def ensure_filter_mute_exclusivity
    if filter_not_following_changed? && filter_not_following?
      self.mute_not_following = false
    elsif mute_not_following_changed? && mute_not_following?
      self.filter_not_following = false
    end

    if filter_not_followers_changed? && filter_not_followers?
      self.mute_not_followers = false
    elsif mute_not_followers_changed? && mute_not_followers?
      self.filter_not_followers = false
    end

    if filter_new_accounts_changed? && filter_new_accounts?
      self.mute_new_accounts = false
    elsif mute_new_accounts_changed? && mute_new_accounts?
      self.filter_new_accounts = false
    end

    if filter_private_mentions_changed? && filter_private_mentions?
      self.mute_private_mentions = false
    elsif mute_private_mentions_changed? && mute_private_mentions?
      self.filter_private_mentions = false
    end
  end
end
