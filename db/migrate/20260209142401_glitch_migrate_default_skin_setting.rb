# frozen_string_literal: true

class GlitchMigrateDefaultSkinSetting < ActiveRecord::Migration[8.0]
  class Setting < ApplicationRecord; end

  def up
    Setting.reset_column_information

    return unless %w(glitch vanilla).include?(flavour)

    setting = Setting.find_by(var: 'skin')
    return unless setting.present? && setting.attributes['value'].present?

    theme = YAML.safe_load(setting.attributes['value'], permitted_classes: [ActiveSupport::HashWithIndifferentAccess, Symbol])
    return unless %w(mastodon-light contrast system).include?(theme)

    setting.update_column('value', "--- default\n")
  end

  def down; end

  private

  def flavour
    setting = Setting.find_by(var: 'flavour')
    return 'glitch' unless setting.present? && setting.attributes['value'].present?

    YAML.safe_load(setting.attributes['value'], permitted_classes: [ActiveSupport::HashWithIndifferentAccess, Symbol])
  end
end
