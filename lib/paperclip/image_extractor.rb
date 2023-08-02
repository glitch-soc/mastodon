# frozen_string_literal: true

require 'mime/types/columnar'

module Paperclip
  class ImageExtractor < Paperclip::Processor
    def make
      return @file unless options[:style] == :original

      image = extract_image_from_file!

      unless image.nil?
        begin
          attachment.instance.thumbnail = image if image.size.positive?
        ensure
          # Paperclip does not automatically delete the source file of
          # a new attachment while working on copies of it, so we need
          # to make sure it's cleaned up

          begin
            image.close(true)
          rescue Errno::ENOENT
            nil
          end
        end
      end

      @file
    end

    private

    def extract_image_from_file!
      dst = Tempfile.new([File.basename(@file.path, '.*'), '.png'])
      dst.binmode

      begin
        if ENV['FFMPEG_API_ENDPOINT'].present?
          receive_file(dst)
        else
          command = Terrapin::CommandLine.new('ffmpeg', '-i :source -loglevel :loglevel -y :destination', logger: Paperclip.logger)
          command.run(source: @file.path, destination: dst.path, loglevel: 'fatal')
      rescue Terrapin::ExitStatusError
        dst.close(true)
        return nil
      rescue Terrapin::CommandNotFoundError
        if ENV['FFMPEG_API_ENDPOINT'].present?
          raise Paperclip::Errors::CommandNotFoundError, 'Could not run the `curl` command. Please install curl.'
        else
          raise Paperclip::Errors::CommandNotFoundError, 'Could not run the `ffmpeg` command. Please install ffmpeg.'
        end
      end

      dst
    end

    def serve_file
      puts 'Uploading the file... (serve_file in lib/paperclip/image_extractor.rb)', @file.path
      command = Terrapin::CommandLine.new('curl', '-X POST -F :source :endpoint')
      puts command.command(source: 'file=@' + @file.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/images')   # preset: default
      command.run(source: 'file=@' + @file.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/images', logger: Paperclip.logger)  # preset: default
    end

    def receive_file(dst)
      result = Oj.load(serve_file, mode: :strict, symbol_keys: true)
      filename = result[:files][0][:name]
      puts "Downloading the file... (receive_file in lib/paperclip/image_extractor.rb)", filename
      command = Terrapin::CommandLine.new('curl', '-X GET -o :destination :endpoint')
      puts command.command(filename: filename, destination: dst.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/download/' + filename + '?delete=no')
      command.run(filename: filename, destination: dst.path, endpoint: ENV['FFMPEG_API_ENDPOINT'] + '/video/extract/download/' + filename + '?delete=no', logger: Paperclip.logger)
    end
  end
end
