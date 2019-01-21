# frozen_string_literal: true

class REST::MuteSerializer < ActiveModel::Serializer
  include RoutingHelper
  
  attributes :id, :target_account, :created_at, :hide_notifications

  belongs_to :account, serializer: REST::AccountSerializer
  belongs_to :target_account, serializer: REST::AccountSerializer
end
