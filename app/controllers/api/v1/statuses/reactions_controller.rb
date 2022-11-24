# frozen_string_literal: true

class Api::V1::Statuses::ReactionsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }
  before_action :require_user!

  before_action :set_status
  before_action :set_reaction, except: :update

  def update
    @status.status_reactions.create!(account: current_account, name: params[:id])
    render_empty
  end

  def destroy
    @reaction.destroy!
    render_empty
  end

  private

  def set_reaction
    @reaction = @status.status_reactions.where(account: current_account).find_by!(name: params[:id])
  end

  def set_status
    @status = Status.find(params[:status_id])
  end
end
