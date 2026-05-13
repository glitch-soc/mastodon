# frozen_string_literal: true

class CreateGamepatchStatusCards < ActiveRecord::Migration[7.0]
  def change
    create_table :gamepatch_status_cards do |t|
      # Avoid duplicate index creation; we add explicit unique indexes below.
      t.references :status, null: false, foreign_key: true, index: false
      t.references :card_instance, null: false, foreign_key: { to_table: :gamepatch_card_instances }, index: false
      t.timestamps
    end

    add_index :gamepatch_status_cards, :status_id, unique: true
    add_index :gamepatch_status_cards, :card_instance_id, unique: true
  end
end
