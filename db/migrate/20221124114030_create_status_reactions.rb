# frozen_string_literal: true

class CreateStatusReactions < ActiveRecord::Migration[6.1]
  def change
    create_table :status_reactions do |t|
      t.references :account, null: false, foreign_key: { on_delete: :cascade }
      t.references :status, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false, default: ''
      t.references :custom_emoji, null: true, foreign_key: { on_delete: :cascade }

      t.timestamps
    end

    add_index :status_reactions, [:account_id, :status_id, :name], unique: true, name: :index_status_reactions_on_account_id_and_status_id
  end
end
