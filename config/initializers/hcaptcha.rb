Hcaptcha.configure do |config|
  config.site_key  = ENV.fetch('HCAPTCHA_SITE_KEY') { '10000000-ffff-ffff-ffff-000000000001' }
  config.secret_key = ENV.fetch('HCAPTCHA_SECRET_KEY') { '0x0000000000000000000000000000000000000000' }
end