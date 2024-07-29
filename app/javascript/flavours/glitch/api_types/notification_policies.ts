// See app/serializers/rest/notification_policy_serializer.rb

export interface NotificationPolicyJSON {
  filter_not_following: boolean;
  filter_not_followers: boolean;
  filter_new_accounts: boolean;
  filter_private_mentions: boolean;
  mute_not_following: boolean;
  mute_not_followers: boolean;
  mute_new_accounts: boolean;
  mute_private_mentions: boolean;
  summary: {
    pending_requests_count: number;
    pending_notifications_count: number;
  };
}
