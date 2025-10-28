import { useCallback, useEffect, useRef } from 'react';
import type { ComponentProps, FC } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import type { ApiMentionJSON } from '@/flavours/glitch/api_types/statuses';
import { useAppSelector } from '@/flavours/glitch/store';
import type { OnElementHandler } from '@/flavours/glitch/utils/html';
import { decode as decodeIDNA } from 'flavours/glitch/utils/idna';

export interface HandledLinkProps {
  href: string;
  text: string;
  prevText?: string;
  hashtagAccountId?: string;
  mention?: Pick<ApiMentionJSON, 'id' | 'acct' | 'username'>;
}

const textMatchesTarget = (text: string, origin: string, host: string) => {
  return (
    text === origin ||
    text === host ||
    text.startsWith(origin + '/') ||
    text.startsWith(host + '/') ||
    'www.' + text === host ||
    ('www.' + text).startsWith(host + '/')
  );
};

export const isLinkMisleading = (link: HTMLAnchorElement) => {
  const linkTextParts: string[] = [];

  // Reconstruct visible text, as we do not have much control over how links
  // from remote software look, and we can't rely on `innerText` because the
  // `invisible` class does not set `display` to `none`.

  const walk = (node: Node) => {
    if (node instanceof Text) {
      linkTextParts.push(node.textContent);
    } else if (node instanceof HTMLElement) {
      if (node.classList.contains('invisible')) return;
      for (const child of node.childNodes) {
        walk(child);
      }
    }
  };

  walk(link);

  const linkText = linkTextParts.join('');
  const targetURL = new URL(link.href);

  if (targetURL.protocol === 'magnet:') {
    return !linkText.startsWith('magnet:');
  }

  if (targetURL.protocol === 'xmpp:') {
    return !(
      linkText === targetURL.href || 'xmpp:' + linkText === targetURL.href
    );
  }

  // The following may not work with international domain names
  if (
    textMatchesTarget(linkText, targetURL.origin, targetURL.host) ||
    textMatchesTarget(linkText.toLowerCase(), targetURL.origin, targetURL.host)
  ) {
    return false;
  }

  // The link hasn't been recognized, maybe it features an international domain name
  const hostname = decodeIDNA(targetURL.hostname).normalize('NFKC');
  const host = targetURL.host.replace(targetURL.hostname, hostname);
  const origin = targetURL.origin.replace(targetURL.host, host);
  const text = linkText.normalize('NFKC');
  return !(
    textMatchesTarget(text, origin, host) ||
    textMatchesTarget(text.toLowerCase(), origin, host)
  );
};

export const tagMisleadingLink = (link: HTMLAnchorElement) => {
  try {
    if (isLinkMisleading(link)) {
      const url = new URL(link.href);
      const tag = document.createElement('span');
      tag.classList.add('link-origin-tag');
      switch (url.protocol) {
        case 'xmpp:':
          tag.textContent = `[${url.href}]`;
          break;
        case 'magnet:':
          tag.textContent = '(magnet)';
          break;
        default:
          tag.textContent = `[${url.host}]`;
      }
      link.insertAdjacentText('beforeend', ' ');
      link.insertAdjacentElement('beforeend', tag);
    }
  } catch (e) {
    // The URL is invalid, remove the href just to be safe
    if (e instanceof TypeError) link.removeAttribute('href');
  }
};

export const HandledLink: FC<HandledLinkProps & ComponentProps<'a'>> = ({
  href,
  text,
  prevText,
  hashtagAccountId,
  mention,
  className,
  children,
  ...props
}) => {
  const rewriteMentions = useAppSelector(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (state) => state.local_settings.get('rewrite_mentions', 'no') as string,
  );
  const tagLinks = useAppSelector(
    (state) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      state.local_settings.get('tag_misleading_links', false) as string,
  );

  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (tagLinks && linkRef.current) tagMisleadingLink(linkRef.current);
  }, [tagLinks]);

  // Handle hashtags
  if (text.startsWith('#') || prevText?.endsWith('#')) {
    const hashtag = text.slice(1).trim();
    return (
      <Link
        className={classNames('mention hashtag', className)}
        to={`/tags/${hashtag}`}
        rel='tag'
        data-menu-hashtag={hashtagAccountId}
      >
        {children}
      </Link>
    );
  } else if (mention) {
    // glitch-soc feature to rewrite mentions
    if (rewriteMentions !== 'no') {
      return (
        <Link
          className={classNames('mention', className)}
          to={`/@${mention.acct}`}
          title={`@${mention.acct}`}
          data-hover-card-account={mention.id}
        >
          @
          <span>
            {rewriteMentions === 'acct' ? mention.acct : mention.username}
          </span>
        </Link>
      );
    }

    // Handle mentions
    return (
      <Link
        className={classNames('mention', className)}
        to={`/@${mention.acct}`}
        title={`@${mention.acct}`}
        data-hover-card-account={mention.id}
      >
        {children}
      </Link>
    );
  }

  // Non-absolute paths treated as internal links. This shouldn't happen, but just in case.
  if (href.startsWith('/')) {
    return (
      <Link className={classNames('unhandled-link', className)} to={href}>
        {children}
      </Link>
    );
  }

  return (
    <a
      {...props}
      href={href}
      title={href}
      className={classNames('unhandled-link', className)}
      target='_blank'
      rel='noreferrer noopener'
      translate='no'
      ref={linkRef}
    >
      {children}
    </a>
  );
};

export const useElementHandledLink = ({
  hashtagAccountId,
  hrefToMention,
}: {
  hashtagAccountId?: string;
  hrefToMention?: (href: string) => ApiMentionJSON | undefined;
} = {}) => {
  const onElement = useCallback<OnElementHandler>(
    (element, { key, ...props }, children) => {
      if (element instanceof HTMLAnchorElement) {
        const mention = hrefToMention?.(element.href);
        return (
          <HandledLink
            {...props}
            key={key as string} // React requires keys to not be part of spread props.
            href={element.href}
            text={element.innerText}
            prevText={element.previousSibling?.textContent ?? undefined}
            hashtagAccountId={hashtagAccountId}
            mention={mention}
          >
            {children}
          </HandledLink>
        );
      }
      return undefined;
    },
    [hashtagAccountId, hrefToMention],
  );
  return { onElement };
};
