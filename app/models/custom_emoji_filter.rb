# frozen_string_literal: true

class CustomEmojiFilter
  KEYS = %i(
    local
    remote
    remote_only
    by_domain
    shortcode
  ).freeze

  attr_reader :params

  def initialize(params)
    @params = params
  end

  def results
    scope = CustomEmoji.alphabetic

    params.each do |key, value|
      next if key.to_s == 'page'

      scope.merge!(scope_for(key, value)) if value.present?

      scope = CustomEmoji.remote_only if key.to_s == 'remote_only'
    end

    scope
  end

  private

  def scope_for(key, value)
    case key.to_s
    when 'local'
      CustomEmoji.local.left_joins(:category).reorder(CustomEmojiCategory.arel_table[:name].asc.nulls_first).order(shortcode: :asc)
    when 'remote'
      CustomEmoji.remote
    when 'remote_only'
      CustomEmoji.remote_only
    when 'by_domain'
      CustomEmoji.where(domain: value.strip.downcase)
    when 'shortcode'
      CustomEmoji.search(value.strip)
    else
      raise Mastodon::InvalidParameterError, "Unknown filter: #{key}"
    end
  end
end
