# frozen_string_literal: true

Fabricator(:status_reaction) do
  account
  status
  name '👍'
  custom_emoji
end
