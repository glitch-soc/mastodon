require 'rails_helper'

RSpec.describe Mute, type: :model do
  subject { Fabricate(:mute) }

  describe '#destroy' do
    it 'destroys associated notes' do
      subject.create_note!(note: 'Too many jorts')
      subject.destroy!

      expect(Glitch::Note.count).to eq(0)
    end
  end
end
