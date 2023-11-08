# frozen_string_literal: true

# == Schema Information
#
# Table name: status_reactions
#
#  id              :bigint(8)        not null, primary key
#  account_id      :bigint(8)        not null
#  status_id       :bigint(8)        not null
#  name            :string           default(""), not null
#  custom_emoji_id :bigint(8)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
class StatusReaction < ApplicationRecord
  belongs_to :account
  belongs_to :status, inverse_of: :status_reactions
  belongs_to :custom_emoji, optional: true

  has_one :notification, as: :activity, dependent: :destroy

  validates :name, presence: true
  validates_with StatusReactionValidator

  before_validation :set_custom_emoji

  private

  # Sets custom_emoji to nil when disabled
  def set_custom_emoji
    self.custom_emoji = CustomEmoji.find_by(disabled: false, shortcode: name, domain: custom_emoji.domain) if name.present? && custom_emoji.present?
  end
end
