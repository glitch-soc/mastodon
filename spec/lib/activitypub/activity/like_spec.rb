# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ActivityPub::Activity::Like do
  let(:sender)    { Fabricate(:account) }
  let(:recipient) { Fabricate(:account) }
  let(:status)    { Fabricate(:status, account: recipient) }

  describe '#perform' do
    context 'with no content' do
      subject { described_class.new(json, sender) }

      let(:json) do
        {
          '@context': 'https://www.w3.org/ns/activitystreams',
          id: 'foo',
          type: 'Like',
          actor: ActivityPub::TagManager.instance.uri_for(sender),
          object: ActivityPub::TagManager.instance.uri_for(status),
        }.with_indifferent_access
      end

      before do
        subject.perform
      end

      it 'creates a favourite from sender to status' do
        expect(sender.favourited?(status)).to be true
      end
    end

    context 'with content' do
      subject { described_class.new(json, sender) }

      context 'with unicode emoji' do
        let(:json) do
          {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: 'foo',
            type: 'Like',
            content: '😂',
            actor: ActivityPub::TagManager.instance.uri_for(sender),
            object: ActivityPub::TagManager.instance.uri_for(status),
          }.with_indifferent_access
        end

        before do
          subject.perform
        end

        it 'creates a reaction from sender to status' do
          expect(sender.reacted?(status, '😂')).to be true
        end
      end

      context 'with custom emoji' do
        let(:json) do
          {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id: 'foo',
            type: 'Like',
            content: ':coolcat:',
            tag: [
              {
                type: 'Emoji',
                icon: {
                  url: 'http://example.com/emoji.png',
                },
                name: 'coolcat',
              },
            ],
            actor: ActivityPub::TagManager.instance.uri_for(sender),
            object: ActivityPub::TagManager.instance.uri_for(status),
          }.with_indifferent_access
        end

        before do
          stub_request(:get, 'http://example.com/emoji.png').to_return(body: attachment_fixture('emojo.png'))

          subject.perform
        end

        it 'creates a reaction from sender to status' do
          emoji = CustomEmoji.find_by(shortcode: 'coolcat', domain: sender.domain)
          expect(emoji)
            .to be_present
            .and have_attributes(
              shortcode: eq('coolcat'),
              domain: eq(sender.domain)
            )
          expect(sender.reacted?(status, 'coolcat', emoji)).to be true
        end
      end
    end
  end
end
