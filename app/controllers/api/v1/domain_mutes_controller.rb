# frozen_string_literal: true

class Api::V1::DomainMutesController < Api::BaseController
  MUTE_LIMIT = 100

  before_action -> { doorkeeper_authorize! :follow, :read, :'read:mutes' }, only: :show
  before_action -> { doorkeeper_authorize! :follow, :write, :'write:mutes' }, except: :show
  before_action :require_user!
  after_action :insert_pagination_headers, only: :show

  def show
    @mutes = load_domain_mutes
    render json: @mutes.map { |domain_mute| domain_mute.as_json(only: %i(domain hide_from_home)) }
  end

  def create
    current_account.mute_domain!(
      domain_mute_params[:domain],
      hide_from_home: domain_mute_params[:hide_from_home]
    )

    # TODO
    # AfterAccountDomainMuteWorker.perform_async(current_account.id, domain_mute_params[:domain])
    render_empty
  end

  def destroy
    current_account.unmute_domain!(domain_mute_params[:domain])
    render_empty
  end

  private

  def load_domain_mutes
    account_domain_mutes.paginate_by_max_id(
      limit_param(MUTE_LIMIT),
      params[:max_id],
      params[:since_id]
    )
  end

  def account_domain_mutes
    current_account.domain_mutes
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    api_v1_domain_mutes_url pagination_params(max_id: pagination_max_id) if records_continue?
  end

  def prev_path
    api_v1_domain_mutes_url pagination_params(since_id: pagination_since_id) unless @mutes.empty?
  end

  def pagination_max_id
    @mutes.last.id
  end

  def pagination_since_id
    @mutes.first.id
  end

  def records_continue?
    @mutes.size == limit_param(MUTE_LIMIT)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def domain_mute_params
    params.permit(:domain, :hide_from_home)
  end
end
