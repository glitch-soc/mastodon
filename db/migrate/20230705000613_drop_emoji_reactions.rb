class DropEmojiReactions < ActiveRecord::Migration[6.1]
  def change
    drop_table :status_reactions
  end
end
