require 'rails_helper'

describe Glitch::AccountInteractions do
  let(:account)            { Fabricate(:account, username: 'account') }
  let(:account_id)         { account.id }
  let(:account_ids)        { [account_id] }
  let(:target_account)     { Fabricate(:account, username: 'target') }
  let(:target_account_id)  { target_account.id }
  let(:target_account_ids) { [target_account_id] }
  
  describe '.mute_note_map' do
    subject { Account.mute_note_map(target_account_ids, account_id) }

    context 'account with Mute' do
      before do
        Fabricate(:mute, target_account: target_account, account: account).tap do |m|
          m.create_note!(note: note) if note
        end
      end

      context 'with a note' do
        let(:note) { 'Too many jorts' }

        it 'returns { target_account_id => "(a note)" }' do
          is_expected.to eq(target_account_id => 'Too many jorts')
        end
      end

      context 'with no associated note' do
        let(:note) { nil }

        it 'returns { target_account_id => nil }' do
          is_expected.to eq(target_account_id => nil)
        end
      end
    end

    context 'account without Mute' do
      it 'returns {}' do
        is_expected.to eq({})
      end
    end
  end

  describe '.block_note_map' do
    subject { Account.block_note_map(target_account_ids, account_id) }

    context 'account with Block' do
      before do
        Fabricate(:block, target_account: target_account, account: account).tap do |m|
          m.create_note!(note: note) if note
        end
      end

      context 'with a note' do
        let(:note) { 'Too many oats' }

        it 'returns { target_account_id => "(a note)" }' do
          is_expected.to eq(target_account_id => 'Too many oats')
        end
      end

      context 'with no associated note' do
        let(:note) { nil }

        it 'returns { target_account_id => nil }' do
          is_expected.to eq(target_account_id => nil)
        end
      end
    end

    context 'account without Block' do
      it 'returns {}' do
        is_expected.to eq({})
      end
    end
  end
end
