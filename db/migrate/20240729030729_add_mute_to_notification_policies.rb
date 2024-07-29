# frozen_string_literal: true

class AddMuteToNotificationPolicies < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def change
    add_column :notification_policies, :mute_not_following, :boolean, default: false, null: false
    add_column :notification_policies, :mute_not_followers, :boolean, default: false, null: false
    add_column :notification_policies, :mute_new_accounts, :boolean, default: false, null: false
    add_column :notification_policies, :mute_private_mentions, :boolean, default: false, null: false
  end
end
