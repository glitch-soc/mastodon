class CreateStatusReactions < ActiveRecord::Migration[6.1]
  def change
    create_table :status_reactions do |t|
      t.references :account, null: false, foreign_key: true
      t.references :status, null: false, foreign_key: true
      t.string :name, null: false, default: ''
      t.references :custom_emoji, null: true, foreign_key: true

      t.timestamps
    end

    add_index :status_reactions, [:account_id, :status_id, :name], unique: true, name: :index_status_reactions_on_account_id_and_status_id
  end
end
