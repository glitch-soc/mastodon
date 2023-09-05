# frozen_string_literal: true

module Paperclip
  # This transcoder is only to be used for the MediaAttachment model
  # to check when uploaded videos are actually gifv's
  class Transcoder < Paperclip::Processor
    # This is the H.264 "High" value taken from https://www.dr-lex.be/info-stuff/videocalc.html
    BITS_PER_PIXEL = 0.11

    def initialize(file, options = {}, attachment = nil)
      super

      @current_format      = File.extname(@file.path)
      @basename            = File.basename(@file.path, @current_format)
      @format              = options[:format]
      @time                = options[:time] || 3
      @passthrough_options = options[:passthrough_options]
      @convert_options     = options[:convert_options].dup
      @vfr_threshold       = options[:vfr_frame_rate_threshold]
    end

    def make
      metadata = VideoMetadataExtractor.new(@file.path)

      raise Paperclip::Error, "Error while transcoding #{@file.path}: unsupported file" unless metadata.valid?

      update_attachment_type(metadata)
      update_options_from_metadata(metadata)

      destination = Tempfile.new([@basename, @format ? ".#{@format}" : ''])
      destination.binmode

      @output_options = @convert_options[:output]&.dup || {}
      @input_options  = @convert_options[:input]&.dup  || {}

      if ENV['FFMPEG_API_ENDPOINT'].present?
        begin
          case @format.to_s
          when 'png'
            receive_file(destination)
            return destination
          when 'mp4'
            receive_mp4_file(destination)
            return destination
          end
        rescue Terrapin::ExitStatusError => e
          raise Paperclip::Error, "Error while transcoding #{@basename}: #{e}"
        rescue Terrapin::CommandNotFoundError
          raise Paperclip::Errors::CommandNotFoundError, 'Could not run the `curl` command. Please install curl.'
        end
      end

      case @format.to_s
      when /jpg$/, /jpeg$/, /png$/, /gif$/
        @input_options['ss'] = @time

        @output_options['f']       = 'image2'
        @output_options['vframes'] = 1
      when 'mp4'
        unless eligible_to_passthrough?(metadata)
          bitrate = (metadata.width * metadata.height * 30 * BITS_PER_PIXEL) / 1_000

          @output_options['b:v']     = "#{bitrate}k"
          @output_options['maxrate'] = "#{bitrate + 192}k"
          @output_options['bufsize'] = "#{bitrate * 5}k"

          if high_vfr?(metadata)
            @output_options['vsync'] = 'vfr'
            @output_options['r'] = @vfr_threshold
          end
        end
      end

      command_arguments, interpolations = prepare_command(destination)

      begin
        command = Terrapin::CommandLine.new('ffmpeg', command_arguments.join(' '), logger: Paperclip.logger)
        command.run(interpolations)
      rescue Terrapin::ExitStatusError => e
        raise Paperclip::Error, "Error while transcoding #{@basename}: #{e}"
      rescue Terrapin::CommandNotFoundError
        raise Paperclip::Errors::CommandNotFoundError, 'Could not run the `ffmpeg` command. Please install ffmpeg.'
      end

      destination
    end

    private

    def prepare_command(destination)
      command_arguments  = ['-nostdin']
      interpolations     = {}
      interpolation_keys = 0

      @input_options.each_pair do |key, value|
        interpolation_key = interpolation_keys
        command_arguments << "-#{key} :#{interpolation_key}"
        interpolations[interpolation_key] = value
        interpolation_keys += 1
      end

      command_arguments << '-i :source'
      interpolations[:source] = @file.path

      @output_options.each_pair do |key, value|
        interpolation_key = interpolation_keys
        command_arguments << "-#{key} :#{interpolation_key}"
        interpolations[interpolation_key] = value
        interpolation_keys += 1
      end

      command_arguments << '-y :destination'
      interpolations[:destination] = destination.path

      [command_arguments, interpolations]
    end

    def update_options_from_metadata(metadata)
      return unless eligible_to_passthrough?(metadata)

      @format          = @passthrough_options[:options][:format] || @format
      @time            = @passthrough_options[:options][:time]   || @time
      @convert_options = @passthrough_options[:options][:convert_options].dup
    end

    def high_vfr?(metadata)
      @vfr_threshold && metadata.r_frame_rate && metadata.r_frame_rate > @vfr_threshold
    end

    def eligible_to_passthrough?(metadata)
      @passthrough_options && @passthrough_options[:video_codecs].include?(metadata.video_codec) && @passthrough_options[:audio_codecs].include?(metadata.audio_codec) && @passthrough_options[:colorspaces].include?(metadata.colorspace)
    end

    def update_attachment_type(metadata)
      @attachment.instance.type = MediaAttachment.types[:gifv] unless metadata.audio_codec
    end

    def serve_file
      puts 'Uploading the file... (serve_file in lib/paperclip/transcoder.rb)', @file.path
      command = Terrapin::CommandLine.new('curl', '-X POST -F :source :endpoint')
      puts command.command(source: 'file=@' + @file.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/images?preset=1')
      command.run(source: 'file=@' + @file.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/images?preset=1', logger: Paperclip.logger)
    end

    def receive_file(destination)
      result = Oj.load(serve_file, mode: :strict, symbol_keys: true)
      filename = result[:files][0][:name]
      puts "Downloading the file... (receive_file in lib/paperclip/transcoder.rb)", filename
      command = Terrapin::CommandLine.new('curl', '-X GET :endpoint -o :destination')
      puts command.command(destination: destination.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/download/' + filename + '?delete=no')
      command.run(destination: destination.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/download/' + filename + '?delete=no', logger: Paperclip.logger)
    end

    def receive_mp4_file(destination)
      puts 'Converting the file... (receive_mp4_file in lib/paperclip/transcoder.rb)', @file.path
      command = Terrapin::CommandLine.new('curl', '-X POST -F :source :endpoint -o :destination')
      puts command.command(source: 'file=@' + @file.path, destination: destination.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/convert/video/to/mp4')
      command.run(source: 'file=@' + @file.path, destination: destination.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/convert/video/to/mp4', logger: Paperclip.logger)
    end
  end
end
