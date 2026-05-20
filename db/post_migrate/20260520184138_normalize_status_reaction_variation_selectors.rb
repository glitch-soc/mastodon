# frozen_string_literal: true

class NormalizeStatusReactionVariationSelectors < ActiveRecord::Migration[8.1]
  # Dummy classes, to make migration possible across version changes
  class StatusReaction < ApplicationRecord; end

  def up
    StatusReaction.where(custom_emoji_id: nil).find_each do |react|
      react.name = Emoji.normalize(react.name)
      react.save!
    end
  end
end
