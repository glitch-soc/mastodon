# frozen_string_literal: true

# == Schema Information
#
# Table name: list_tag
#
#  id                :bigint(8)        not null, primary key
#  list_id           :bigint(8)        not null
#  tag_id            :bigint(8)        not null
#

class ListTag < ApplicationRecord
  belongs_to :list
  belongs_to :tag

  validates :tag_id, uniqueness: { scope: :list_id }

  private

end
