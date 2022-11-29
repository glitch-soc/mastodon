# frozen_string_literal: true

class StatusReactionValidator < ActiveModel::Validator
  SUPPORTED_EMOJIS = Oj.load_file(Rails.root.join('app', 'javascript', 'mastodon', 'features', 'emoji', 'emoji_map.json').to_s).keys.freeze

  LIMIT = [1, (ENV['MAX_REACTIONS'] || 8).to_i].max

  def validate(reaction)
    return if reaction.name.blank?

    reaction.errors.add(:name, I18n.t('reactions.errors.unrecognized_emoji')) if reaction.custom_emoji_id.blank? && !unicode_emoji?(reaction.name)
    reaction.errors.add(:base, I18n.t('reactions.errors.limit_reached')) if limit_reached?(reaction)
  end

  private

  def unicode_emoji?(name)
    SUPPORTED_EMOJIS.include?(name)
  end

  def new_reaction?(reaction)
    !reaction.status.status_reactions.where(name: reaction.name).exists?
  end

  def limit_reached?(reaction)
    reaction.status.status_reactions.where(status: reaction.status, account: reaction.account).count >= LIMIT
  end
end
