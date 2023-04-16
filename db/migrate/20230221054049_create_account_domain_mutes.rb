class CreateAccountDomainMutes < ActiveRecord::Migration[6.1]
  def change
    create_table :account_domain_mutes do |t|
      t.string :domain
      t.bigint :account_id
      t.boolean :hide_from_home

      t.timestamps
    end

    add_index :account_domain_mutes, [:account_id, :domain], unique: true
  end
end
