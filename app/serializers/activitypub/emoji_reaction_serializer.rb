# frozen_string_literal: true

class ActivityPub::EmojiReactionSerializer < ActivityPub::Serializer
  attributes :id, :type, :actor, :content
  attribute :virtual_object, key: :object

  has_one :custom_emoji, key: :tag, serializer: ActivityPub::EmojiSerializer, unless: -> { object.custom_emoji.nil? }

  def id
    [ActivityPub::TagManager.instance.uri_for(object.account), '#emoji_reactions/', object.id].join
  end

  def type
    'EmojiReact'
  end

  def actor
    ActivityPub::TagManager.instance.uri_for(object.account)
  end

  def virtual_object
    ActivityPub::TagManager.instance.uri_for(object.status)
  end

  def content
    if object.custom_emoji.nil?
      object.name
    else
      ":#{object.name}:"
    end
  end

  alias reaction content
end
