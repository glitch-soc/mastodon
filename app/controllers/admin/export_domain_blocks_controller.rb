# frozen_string_literal: true

require 'csv'

module Admin
  class ExportDomainBlocksController < BaseController
    include AdminExportControllerConcern

    before_action :set_dummy_import!, only: [:new]

    ROWS_PROCESSING_LIMIT = 20_000

    def new
      authorize :domain_block, :create?
    end

    def export
      authorize :instance, :index?
      send_export_file
    end

    def import
      authorize :domain_block, :create?

      if params[:admin_import]&.key?(:data)
        import_from_upload!
      else
        import_from_remote_domain!
      end
    end

    private

    def export_filename
      'domain_blocks.csv'
    end

    def export_headers
      %w(#domain #severity #reject_media #reject_reports #public_comment #obfuscate)
    end

    def export_data
      CSV.generate(headers: export_headers, write_headers: true) do |content|
        DomainBlock.with_user_facing_limitations.each do |instance|
          content << [instance.domain, instance.severity, instance.reject_media, instance.reject_reports, instance.public_comment, instance.obfuscate]
        end
      end
    end

    def import_from_remote_domain!
      remote_url = import_params[:url]
      remote_url = "https://#{remote_url}" unless remote_url.start_with?('http://') || remote_url.start_with?('https://')
      remote_url = Addressable::URI.parse(remote_url)
      remote_url.path = '/about/more'

      @global_private_comment = I18n.t('admin.export_domain_blocks.import.private_comment_template', source: remote_url.host, date: I18n.l(Time.now.utc))

      @form = Form::DomainBlockBatch.new
      @domain_blocks = domain_blocks_attributes_from_url(remote_url.to_s).filter_map do |domain, attributes|
        next if DomainBlock.rule_for(domain).present?

        domain_block = DomainBlock.new(attributes.merge(private_comment: @global_private_comment))

        domain_block if domain_block.valid?
      end

      @warning_domains = Instance.where(domain: @domain_blocks.map(&:domain)).where('EXISTS (SELECT 1 FROM follows JOIN accounts ON follows.account_id = accounts.id OR follows.target_account_id = accounts.id WHERE accounts.domain = instances.domain)').pluck(:domain)
    end

    def import_from_upload!
      @import = Admin::Import.new(import_params.slice(:data))
      parse_import_data!(export_headers)

      @global_private_comment = I18n.t('admin.export_domain_blocks.import.private_comment_template', source: @import.data_file_name, date: I18n.l(Time.now.utc))

      @form = Form::DomainBlockBatch.new
      @domain_blocks = @data.take(ROWS_PROCESSING_LIMIT).filter_map do |row|
        domain = row['#domain'].strip
        next if DomainBlock.rule_for(domain).present?

        domain_block = DomainBlock.new(domain: domain,
                                       severity: row['#severity'].strip,
                                       reject_media: row['#reject_media'].strip,
                                       reject_reports: row['#reject_reports'].strip,
                                       private_comment: @global_private_comment,
                                       public_comment: row['#public_comment']&.strip,
                                       obfuscate: row['#obfuscate'].strip)

        domain_block if domain_block.valid?
      end

      @warning_domains = Instance.where(domain: @domain_blocks.map(&:domain)).where('EXISTS (SELECT 1 FROM follows JOIN accounts ON follows.account_id = accounts.id OR follows.target_account_id = accounts.id WHERE accounts.domain = instances.domain)').pluck(:domain)
    rescue ActionController::ParameterMissing
      flash.now[:alert] = I18n.t('admin.export_domain_blocks.no_file')
      set_dummy_import!
      render :new
    end

    def domain_blocks_attributes_from_url(url)
      Request.new(:get, url).perform do |response|
        document = Nokogiri::HTML(response.body.to_s)
        lang = document.root.attributes['lang'].value

        titles = document.xpath('//*[@id="unavailable-content"]/following-sibling::h3')
        tables = document.xpath('//*[@id="unavailable-content"]/following-sibling::table')

        severity_by_title = %w(rejecting_media silenced suspended).index_by { |type| I18n.t("about.unavailable_content_description.#{type}_title", locale: lang) }

        domains = {}

        titles.zip(tables).each do |title, table|
          severity = severity_by_title[title.text]
          next if severity.blank?

          table.xpath('./tbody/tr').each do |tr|
            domain_td, reason_td = tr.xpath('./td')
            reason = reason_td.text.strip
            domain_span = domain_td.xpath('./span').first
            domain = domain_span.text.strip
            domain_checksum = domain_span.attributes['title']
            obfuscate = domain.include?('*')
            next if obfuscate && !domain.match?(/\A[a-z0-9.*-]+\Z/)

            if obfuscate
              candidates = Instance.where(Instance.arel_table[:domain].matches(domain.gsub('*', '_'))).pluck(:domain)
              candidate = candidates.find { |domain| "SHA-256: #{Digest::SHA256.hexdigest(domain)}" == domain_checksum }
              next unless candidate
              domain = candidate
            end

            domains[domain] ||= { public_comment: reason, obfuscate: obfuscate, domain: domain, severity: :noop, reject_media: false }
            domains[domain][:severity] = :silence if severity == 'silenced'
            domains[domain][:severity] = :suspend if severity == 'suspended'
            domains[domain][:reject_media] = true if severity == 'rejecting_media'
          end
        end

        domains
      end
    end
  end
end
