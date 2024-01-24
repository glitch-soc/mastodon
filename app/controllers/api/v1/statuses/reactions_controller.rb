# frozen_string_literal: true

class Api::V1::Statuses::ReactionsController < Api::V1::Statuses::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }
  before_action :require_user!

  def create
    ReactService.new.call(current_account, @status, params[:id])
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    UnreactWorker.perform_async(current_account.id, @status.id, params[:id])

    render json: @status, serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new([@status], current_account.id, reactions_map: { @status.id => false })
  rescue Mastodon::NotPermittedError
    not_found
  end
end
