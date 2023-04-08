class MigrateShowReblogsRepliesInPublicTimelinesSetting < ActiveRecord::Migration[6.1]
  def up
    show_reblogs_in_public_timelines = Setting.find_by(var: 'show_reblogs_in_public_timelines')
    if show_reblogs_in_public_timelines.nil? || show_reblogs_in_public_timelines.value
      setting_local = Setting.where(var: 'show_reblogs_in_local_timelines').first_or_initialize(var: 'show_reblogs_in_local_timelines')
      setting_federated = Setting.where(var: 'show_reblogs_in_federated_timelines').first_or_initialize(var: 'show_reblogs_in_federated_timelines')
      setting_local.update(value: true)
      setting_federated.update(value: true)
    end

    show_replies_in_public_timelines = Setting.find_by(var: 'show_replies_in_public_timelines')
    if show_replies_in_public_timelines.nil? || show_replies_in_public_timelines.value
      setting_local = Setting.where(var: 'show_replies_in_local_timelines').first_or_initialize(var: 'show_replies_in_local_timelines')
      setting_federated = Setting.where(var: 'show_replies_in_federated_timelines').first_or_initialize(var: 'show_replies_in_federated_timelines')
      setting_local.update(value: true)
      setting_federated.update(value: true)
    end
  end

  def down
    show_reblogs_in_local_timelines = Setting.find_by(var: 'show_reblogs_in_local_timelines')
    show_reblogs_in_federate_timelines = Setting.find_by(var: 'show_reblogs_in_federated_timelines')
    if show_reblogs_in_local_timelines.nil? || show_reblogs_in_local_timelines.value || show_reblogs_in_federated_timelines.nil? || show_reblogs_in_federated_timelines.value
      setting = Setting.where(var: 'show_reblogs_in_public_timelines').first_or_initialize(var: 'show_reblogs_in_public_timelines')
      setting.update(value: true)
    end

    show_replies_in_public_timelines = Setting.find_by(var: 'show_replies_in_public_timelines')
    if show_replies_in_local_timelines.nil? || show_replies_in_local_timelines.value || show_replies_in_federated_timelines.nil? || show_replies_in_federated_timelines.value
      setting = Setting.where(var: 'show_replies_in_public_timelines').first_or_initialize(var: 'show_replies_in_public_timelines')
      setting.update(value: true)
    end
  end
end  
