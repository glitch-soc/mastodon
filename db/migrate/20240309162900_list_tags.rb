class ListTags < ActiveRecord::Migration[7.1]
  def change
      create_table :list_tags do |t|
        t.belongs_to :list, foreign_key: { on_delete: :cascade }, null: false
        t.belongs_to :tag, foreign_key: { on_delete: :cascade }, null: false
      end
  
      add_index :list_tags, [:tag_id, :list_id], unique: true
      add_index :list_tags, [:list_id, :tag_id]
  end
end
