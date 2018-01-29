# == Schema Information
#
# Table name: glitch_notes
#
#  id          :integer          not null, primary key
#  target_id   :integer          not null
#  target_type :string           not null
#  note        :text             not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

class Glitch::Note < ApplicationRecord
  belongs_to :target, polymorphic: true

  validates :note, presence: true

  alias_attribute :text, :note
end
