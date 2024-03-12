# frozen_string_literal: true

class Api::V1::Lists::TagsController < Api::BaseController
  before_action -> { doorkeeper_authorize! :read, :'read:lists' }, only: [:show]
  before_action -> { doorkeeper_authorize! :write, :'write:lists' }, except: [:show]

  before_action :require_user!
  before_action :set_list

  after_action :insert_pagination_headers, only: :show

  def show
    @tags = load_tags
    render json: @tags, each_serializer: REST::TagSerializer
  end

  def create
    ApplicationRecord.transaction do
      list_tags.each do |tag|
        @list.tags << tag
      end
    end
    @tags = load_tags
    render json: @tags, each_serializer: REST::TagSerializer
  end

  def destroy
    ListTag.where(list: @list, tag_id: tag_ids).destroy_all
    render_empty
  end

  private

  def set_list
    @list = List.where(account: current_account).find(params[:list_id])
  end

  def load_tags
    if unlimited?
      @list.tags.all
    else
      @list.tags.paginate_by_max_id(limit_param(DEFAULT_TAGS_LIMIT), params[:max_id], params[:since_id])
    end
  end

  def list_tags
    names = tag_ids.grep_v(/\A[0-9]+\Z/)
    ids = tag_ids.grep(/\A[0-9]+\Z/)
    existing_by_name = Tag.where(name: names.map { |n| Tag.normalize(n) }).select(:id, :name)
    ids.push(*existing_by_name.map(&:id))
    not_existing_by_name = names.reject { |n| existing_by_name.any? { |e| e.name == Tag.normalize(n) } }
    created = Tag.find_or_create_by_names(not_existing_by_name)
    ids.push(*created.map(&:id))
    Tag.find(ids)
  end

  def tag_ids
    Array(resource_params[:tag_ids])
  end

  def resource_params
    params.permit(tag_ids: [])
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    return if unlimited?

    api_v1_list_tags_url pagination_params(max_id: pagination_max_id) if records_continue?
  end

  def prev_path
    return if unlimited?

    api_v1_list_tags_url pagination_params(since_id: pagination_since_id) unless @tags.empty?
  end

  def pagination_max_id
    @tags.last.id
  end

  def pagination_since_id
    @tags.first.id
  end

  def records_continue?
    @tags.size == limit_param(DEFAULT_TAGS_LIMIT)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def unlimited?
    params[:limit] == '0'
  end
end
