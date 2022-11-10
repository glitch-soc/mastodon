# frozen_string_literal: true

class Sanitize
  module Config
    HTTP_PROTOCOLS = %w(
      http
      https
    ).freeze

    LINK_PROTOCOLS = %w(
      http
      https
      dat
      dweb
      ipfs
      ipns
      ssb
      gopher
      xmpp
      magnet
      gemini
    ).freeze

    # We remove all "style" attributes. In particular we remove all color
    # attributes and length percentages.
    COMMON_MATH_ATTRS = %w(
      dir
      displaystyle
      mathvariant
      scriptlevel
    ).freeze
    MATH_TAG_ATTRS = {
      'annotation' => %w(encoding),
      'annotation-xml' => %w(encoding),
      'maction' => %w(),
      'math' => %w(display alttext),
      'merror' => %w(),
      # See below
      'mfrac' => %w(linethickness),
      'mi' => %w(),
      'mmultiscripts' => %w(),
      'mn' => %w(),
      'mo' => %w(form fence separator stretchy symmetric largeop movablelimits lspace rspace minsize),
      'mover' => %w(accent),
      'mpadded' => %w(width height depth lspace voffset),
      'mphantom' => %w(),
      'mprescripts' => %w(),
      'mroot' => %w(),
      'mrow' => %w(),
      'ms' => %w(),
      'mspace' => %w(width height depth),
      'msqrt' => %w(),
      'mstyle' => %w(),
      'msub' => %w(),
      'msubsup' => %w(),
      'msup' => %w(),
      'mtable' => %w(),
      'mtd' => %w(colspan rowspan),
      'mtext' => %w(),
      'mtr' => %w(),
      'munder' => %w(accentunder),
      'munderover' => %w(accent accentunder),
      'semantics' => %w(),
    }.transform_values { |attr_list| attr_list + COMMON_MATH_ATTRS }.freeze

    # We need some special logic for some math tags.
    #
    # In particular, <mathfrac> contains a (usually stylistic) attribute
    # `linethickness`, which denotes the thickness of the horizontal bar.
    # However, `linethickness="0"`, erases the horizontal bar completely. This
    # looks more like a two-element table, and could denote a two-element
    # vector, or (in the MathML Core spec) the binomial coefficient!
    # For example:
    #   <mo>(</mo><mfrac linethickness="0"><mi>x</mi><mi>y</mi></mfrac><mo>)</mo>
    # denotes xCy, while
    #   <mo>(</mo><mfrac><mi>x</mi><mi>y</mi></mfrac><mo>)</mo>
    # denotes (x/y). These two constructions are very different and the
    # distinction needs to be mantained.
    MATH_TRANSFORMER = lambda do |env|
      node = env[:node]
      return if env[:is_allowlisted] || !node.element?
      return unless env[:node_name] == 'mfrac'

      node.attribute_nodes.each do |attr|
        attr.unlink if attr.name == 'linethickness' && attr.value != '0'
      end
      # we don't allowlist the node. instead we let the CleanElement transformer
      # take care of the rest of the attributes.
    end

    CLASS_WHITELIST_TRANSFORMER = lambda do |env|
      node = env[:node]
      class_list = node['class']&.split(/[\t\n\f\r ]/)

      return unless class_list

      class_list.keep_if do |e|
        next true if /^(h|p|u|dt|e)-/.match?(e) # microformats classes
        next true if /^(mention|hashtag)$/.match?(e) # semantic classes
        next true if /^(ellipsis|invisible)$/.match?(e) # link formatting classes
      end

      node['class'] = class_list.join(' ')
    end

    IMG_TAG_TRANSFORMER = lambda do |env|
      node = env[:node]

      return unless env[:node_name] == 'img'

      node.name = 'a'

      node['href'] = node['src']
      if node['alt'].present?
        node.content = "[🖼  #{node['alt']}]"
      else
        url = node['href']
        prefix = url.match(%r{\Ahttps?://(www\.)?}).to_s
        text   = url[prefix.length, 30]
        text += '…' if url.length - prefix.length > 30
        node.content = "[🖼  #{text}]"
      end
    end

    TRANSLATE_TRANSFORMER = lambda do |env|
      node = env[:node]
      node.remove_attribute('translate') unless node['translate'] == 'no'
    end

    UNSUPPORTED_HREF_TRANSFORMER = lambda do |env|
      return unless env[:node_name] == 'a'

      current_node = env[:node]

      scheme = if current_node['href'] =~ Sanitize::REGEX_PROTOCOL
                 Regexp.last_match(1).downcase
               else
                 :relative
               end

      current_node.replace(Nokogiri::XML::Text.new(current_node.text, current_node.document)) unless LINK_PROTOCOLS.include?(scheme)
    end

    MASTODON_STRICT ||= freeze_config(
      elements: %w(p br span a abbr del pre blockquote code b strong u sub sup i em h1 h2 h3 h4 h5 ul ol li) + MATH_TAG_ATTRS.keys,

      attributes: {
        'a' => %w(href rel class title translate),
        'abbr' => %w(title),
        'span' => %w(class translate),
        'blockquote' => %w(cite),
        'ol' => %w(start reversed),
        'li' => %w(value),
      }.merge(MATH_TAG_ATTRS),

      add_attributes: {
        'a' => {
          'rel' => 'nofollow noopener noreferrer',
          'target' => '_blank',
        },
      },

      protocols: {
        'a' => { 'href' => LINK_PROTOCOLS },
        'blockquote' => { 'cite' => LINK_PROTOCOLS },
      },

      transformers: [
        CLASS_WHITELIST_TRANSFORMER,
        IMG_TAG_TRANSFORMER,
        TRANSLATE_TRANSFORMER,
        UNSUPPORTED_HREF_TRANSFORMER,
        MATH_TRANSFORMER,
      ]
    )

    MASTODON_OEMBED ||= freeze_config(
      elements: %w(audio embed iframe source video),

      attributes: {
        'audio' => %w(controls),
        'embed' => %w(height src type width),
        'iframe' => %w(allowfullscreen frameborder height scrolling src width),
        'source' => %w(src type),
        'video' => %w(controls height loop width),
      },

      protocols: {
        'embed' => { 'src' => HTTP_PROTOCOLS },
        'iframe' => { 'src' => HTTP_PROTOCOLS },
        'source' => { 'src' => HTTP_PROTOCOLS },
      },

      add_attributes: {
        'iframe' => { 'sandbox' => 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms' },
      }
    )

    LINK_REL_TRANSFORMER = lambda do |env|
      return unless env[:node_name] == 'a' && env[:node]['href']

      node = env[:node]

      rel = (node['rel'] || '').split & ['tag']
      rel += %w(nofollow noopener noreferrer) unless TagManager.instance.local_url?(node['href'])

      if rel.empty?
        node.remove_attribute('rel')
      else
        node['rel'] = rel.join(' ')
      end
    end

    LINK_TARGET_TRANSFORMER = lambda do |env|
      return unless env[:node_name] == 'a' && env[:node]['href']

      node = env[:node]
      if node['target'] != '_blank' && TagManager.instance.local_url?(node['href'])
        node.remove_attribute('target')
      else
        node['target'] = '_blank'
      end
    end

    MASTODON_OUTGOING ||= freeze_config MASTODON_STRICT.merge(
      attributes: merge(
        MASTODON_STRICT[:attributes],
        'a' => %w(href rel class title target translate)
      ),

      add_attributes: {},

      transformers: [
        CLASS_WHITELIST_TRANSFORMER,
        IMG_TAG_TRANSFORMER,
        TRANSLATE_TRANSFORMER,
        UNSUPPORTED_HREF_TRANSFORMER,
        LINK_REL_TRANSFORMER,
        LINK_TARGET_TRANSFORMER,
        MATH_TRANSFORMER,
      ]
    )
  end
end
