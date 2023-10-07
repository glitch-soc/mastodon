# frozen_string_literal: true

module MisskeyFlavoredMarkdown
  # sparkle tags are ignored because they require adding new elements to the DOM and I simply don't want to deal with that right now
  MFM_TAGS = %w(sparkle small crop tada jelly twitch spin jump bounce font fade shake rainbow flip x2 x3 x4 blur rotate position scale fg bg).freeze
  ALLOWED_SPAN_ATTRIBUTES = %w(style class).freeze
  MFM_TOKEN_MATCH = /\$\[(?<tag>[\w\d]+)(?:\.(?<opt>\S+))?\s(?<content>[\s\S]+)\]/

  module_function

  def valid_time(time)
    return unless time&.match?(/^[0-9.]+s$/)

    time
  end

  def valid_number(number)
    float = number&.to_f
    return if float.nil? || float.nan?

    float
  end

  MFM_TRANSFORMER = lambda do |env|
    node = env[:node]

    if node.name == 'small' || (!node['mfm-tag'].nil? && node['mfm-tag'] == 'small')
      node.name = 'span'
      node['style'] = 'opacity: 0.7; font-size: smaller;'
      # rubocop:disable Style/HashEachMethods
      node.keys.each do |attribute|
        # rubocop:enable Style/HashEachMethods
        node.delete attribute unless attribute == 'style'
      end
      return { node_allowlist: [node] }
    end

    if node.name == 'center'
      node.name = 'div'
      node['style'] = 'text-align: center;'
      # rubocop:disable Style/HashEachMethods
      node.keys.each do |attribute|
        # rubocop:enable Style/HashEachMethods
        node.delete attribute unless attribute == 'style'
      end
      return { node_allowlist: [node] }
    end

    return if node['mfm-tag'].blank?

    tag = node['mfm-tag']
    node['style'] = 'display: inline-block;'
    case tag
    when 'crop'
      top = valid_number(node['mfm-top']) || 0
      bottom = valid_number(node['mfm-bottom']) || 0
      left = valid_number(node['mfm-left']) || 0
      right = valid_number(node['mfm-right']) || 0
      node['style'] += "clip-path: inset(#{top}% #{right}% #{bottom}% #{left}%);"
    when 'font'
      family = nil
      family = 'serif' if node['mfm-serif'].present?
      family = 'monospace' if node['mfm-monospace'].present?
      family = 'cursive' if node['mfm-cursive'].present?
      family = 'fantasy' if node['mfm-fantasy'].present?
      family = 'emoji' if node['mfm-emoji'].present?
      family = 'math' if node['mfm-math'].present?
      node['style'] += "font-family: #{family};" unless family.nil?
    when 'rotate'
      degrees = valid_number(node['mfm-deg']) || 90
      node['style'] += "transform: rotate(#{degrees}deg); transform-origin: center center;"
    when 'position'
      x = valid_number(node['mfm-x']) || 0
      y = valid_number(node['mfm-y']) || 0
      node['style'] += "transform: translateX(#{x}em) translateY(#{y}em);"
    when 'scale'
      x = (valid_number(node['mfm-x']) || 1).clamp(-5, 5)
      y = (valid_number(node['mfm-y']) || 1).clamp(-5, 5)
      node['style'] += "transform: scale(#{x}, #{y});"
    when 'flip'
      h = node['mfm-h'] || false
      v = node['mfm-v'] || false
      transform = if h && v
                    'scale(-1, -1)'
                  elsif v
                    'scaleY(-1)'
                  else
                    'scaleX(-1)'
                  end
      node['style'] += "transform: #{transform};"
    when 'tada'
      speed = valid_time(node['mfm-speed']) || '1s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "font-size: 150%; animation: mfm-tada #{speed} #{delay} linear #{loops} both;"
    when 'jelly'
      speed = valid_time(node['mfm-speed']) || '1s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "animation: mfm-rubberband #{speed} #{delay} linear #{loops};"
    when 'rainbow'
      speed = valid_time(node['mfm-speed']) || '1s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "animation: mfm-rainbow #{speed} #{delay} linear #{loops};"
    when 'jump'
      speed = valid_time(node['mfm-speed']) || '0.75s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "animation: mfm-jump #{speed} #{delay} linear #{loops};"
    when 'bounce'
      speed = valid_time(node['mfm-speed']) || '0.75s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "animation: mfm-bounce #{speed} #{delay} linear #{loops}; transform-origin: center bottom;"
    when 'twitch'
      speed = valid_time(node['mfm-speed']) || '0.5s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['twitch'] += "animation: mfm-twitch #{speed} #{delay} ease #{loops};"
    when 'shake'
      speed = valid_time(node['mfm-speed']) || '0.5s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "animation: mfm-shake #{speed} #{delay} ease #{loops};"
    when 'fade'
      direction = if node['mfm-out'].present?
                    'alternate-reverse'
                  else
                    'alternate'
                  end
      speed = valid_time(node['mfm-speed']) || '1.5s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "animation: mfm-fade #{speed} #{delay} linear #{loops}; animation-direction: #{direction};"
    when 'spin'
      direction = if node['mfm-left'].present?
                    'reverse'
                  else
                    'alternate' if node['mfm-alternate'].present?
                    'normal'
                  end
      animation = if node['mfm-x'].present?
                    'mfm-spin-x'
                  else
                    'mfm-spin-y' if node['mfm-y'].present?
                    'mfm-spin'
                  end
      speed = valid_time(node['mfm-speed']) || '1.5s'
      delay = valid_time(node['mfm-delay']) || '0s'
      loops = valid_number(node['mfm-loop']) || 'infinite'
      node['style'] += "animation: #{animation} #{speed} #{delay} linear #{loops}; animation-direction: #{direction};"
    when 'bg'
      color = if node['mfm-color']&.match?(/^[0-9a-f]{3,6}$/i)
                node['mfm-color']
              else
                'f00'
              end
      node['style'] += "background-color: ##{color};"
    when 'fg'
      color = if node['mfm-color']&.match?(/^[0-9a-f]{3,6}$/i)
                node['mfm-color']
              else
                'f00'
              end
      node['style'] += "color: ##{color};"
    end
    # rubocop:disable Style/HashEachMethods
    node.keys.each do |attribute|
      # rubocop:enable Style/HashEachMethods
      node.delete attribute unless ALLOWED_SPAN_ATTRIBUTES.include?(attribute)
    end
    { node_allowlist: [node] }
  end

  def token_to_html(token)
    match = MFM_TOKEN_MATCH.match(token)
    tag = match[:tag]
    # if tag isn't supported, just return the token string as-is
    return token unless MFM_TAGS.include?(tag)

    opt = match[:opt]&.split(',')&.map do |string|
      key_value = string.split('=')
      # TODO: escape options- Not particularly necessary because it's sanitized but it's probably a good idea anyways
      "mfm-#{key_value[0]}=\"#{key_value[1]}\""
    end&.join
    content = to_html(match[:content])

    "<span class=\"mfm mfm-#{tag}\" mfm-tag=\"#{tag}\" #{opt}>#{content}</span>"
  end

  def to_html(text)
    # these are safe to do here because they cannot interfere with emoji.
    # underscore italics need to be parsed later because emoji can contain underscores
    text.gsub!(/\*\*(.*?)\*\*/m, '<b>\1</b>')
    text.gsub!(/\*(.*?)\*/m, '<i>\1</i>')
    text.gsub!(/~~(.*?)~~/m, '<s>\1</s>')
    depth = 0
    state = :none
    tokens = []
    current = ''
    in_emoji = false
    formatting = :normal
    text.each_char do |char|
      normal_state = [:none, :in_tag].include?(state)
      in_emoji = !in_emoji if char == ':'
      case char
      when "\n"
        current += '<br/>'
        next
      when '_'
        if normal_state && !in_emoji
          if formatting == :normal
            current = "#{current[0..-2]}<i>"
            formatting = :italic
            next
          elsif formatting == :italic
            current = "#{current[0..-2]}</i>"
            formatting = :normal
            next
          end
        end
      when '$'
        if normal_state
          if state == :none
            tokens << current
            current = ''
          end
          state = :expecting_tag
        end
      when '['
        if state == :expecting_tag
          depth += 1
          state = :in_tag
        end
      when ']'
        if state == :in_tag
          depth -= 1
          if depth.zero?
            current += char
            tokens << token_to_html(current)
            state = :none
            current = ''
            next
          end
        end
      end
      current += char
    end
    tokens << current
    tokens.join
  end
end
