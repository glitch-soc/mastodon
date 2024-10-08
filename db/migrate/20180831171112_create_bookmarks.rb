# frozen_string_literal: true

# This migration is a duplicate of 20180410220657

class CreateBookmarks < ActiveRecord::Migration[5.2]
  def up
    return if table_exists?(:bookmarks)

    create_table :bookmarks do |t|
      t.references :account, null: false
      t.references :status, null: false

      t.timestamps
    end

    safety_assured do
      add_foreign_key :bookmarks, :accounts, column: :account_id, on_delete: :cascade
      add_foreign_key :bookmarks, :statuses, column: :status_id, on_delete: :cascade
    end

    add_index :bookmarks, [:account_id, :status_id], unique: true
  end

  def down
    drop_table :bookmarks
  end
end
