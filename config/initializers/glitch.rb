# frozen_string_literal: true

module Glitch
  class Application < Rails::Application
    config.x.glitch = config_for(:glitch)
  end
end
