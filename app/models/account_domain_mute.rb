# == Schema Information
#
# Table name: account_domain_mutes
#
#  id             :bigint(8)        not null, primary key
#  domain         :string
#  account_id     :bigint(8)
#  hide_from_home :boolean
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
class AccountDomainMute < ApplicationRecord
  include Paginable
  include DomainNormalizable

  belongs_to :account
  validates :domain, presence: true, uniqueness: { scope: :account_id }, domain: true

  after_commit :remove_mute_cache

  private

  def remove_mute_cache
    Rails.cache.delete("mute_domains_for:#{account_id}")
  end
end
