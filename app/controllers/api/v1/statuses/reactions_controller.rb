# frozen_string_literal: true

class Api::V1::Statuses::ReactionsController < Api::V1::Statuses::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }
  before_action :require_user!
  skip_before_action :set_status, only: [:destroy]

  def create
    ReactService.new.call(current_account, @status, Emoji.normalize(params[:id]))
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    name = Emoji.normalize(params[:id])
    react = current_account.status_reactions.find_by(status_id: params[:status_id], name: name)

    if react
      @status = react.status
      UnreactWorker.perform_async(current_account.id, @status.id, name)
    else
      @status = Status.find(params[:status_id])
      authorize @status, :show?
    end

    render json: @status, serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new([@status], current_account.id, reactions_map: { @status.id => false })
  rescue ActiveRecord::RecordNotFound, Mastodon::NotPermittedError
    not_found
  end
end
