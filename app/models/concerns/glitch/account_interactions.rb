# frozen_string_literals: true

module Glitch::AccountInteractions
  extend ActiveSupport::Concern

  class_methods do
    def mute_note_map(target_account_ids, account_id)
      notes_from_relationship(Mute, target_account_ids, account_id).each_with_object({}) do |mute, mapping|
        mapping[mute.target_account_id] = mute.note&.text
      end
    end

    def block_note_map(target_account_ids, account_id)
      notes_from_relationship(Block, target_account_ids, account_id).each_with_object({}) do |block, mapping|
        mapping[block.target_account_id] = block.note&.text
      end
    end

    private

    def notes_from_relationship(klass, target_account_ids, account_id)
      klass.where(target_account_id: target_account_ids, account_id: account_id).includes(:note)
    end
  end
end
