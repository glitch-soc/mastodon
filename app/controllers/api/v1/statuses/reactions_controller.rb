# frozen_string_literal: true

class Api::V1::Statuses::ReactionsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }
  before_action :require_user!
  before_action :set_status

  def create
    ReactService.new.call(current_account, @status, normalize(params[:id]))
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    UnreactWorker.perform_async(current_account.id, @status.id, normalize(params[:id]))

    render json: @status, serializer: REST::StatusSerializer, relationships: StatusRelationshipsPresenter.new([@status], current_account.id, reactions_map: { @status.id => false })
  rescue Mastodon::NotPermittedError
    not_found
  end

  private

  def normalize(name)
    normalized = "#{name}\uFE0F"
    return normalized if StatusReactionValidator::SUPPORTED_EMOJIS.include?(normalized)

    name
  end

  def set_status
    @status = Status.find(params[:status_id])
    authorize @status, :show?
  rescue Mastodon::NotPermittedError
    not_found
  end
end
