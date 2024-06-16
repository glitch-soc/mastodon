/* eslint-disable @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-explicit-any,
                  @typescript-eslint/no-unsafe-assignment */

import type { CSSProperties } from 'react';
import { useState, useRef, useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { AnimatedNumber } from 'flavours/glitch/components/animated_number';
import AttachmentList from 'flavours/glitch/components/attachment_list';
import { Avatar } from 'flavours/glitch/components/avatar';
import { ContentWarning } from 'flavours/glitch/components/content_warning';
import { DisplayName } from 'flavours/glitch/components/display_name';
import { EditedTimestamp } from 'flavours/glitch/components/edited_timestamp';
import { FilterWarning } from 'flavours/glitch/components/filter_warning';
import { FormattedDateWrapper } from 'flavours/glitch/components/formatted_date';
import type { StatusLike } from 'flavours/glitch/components/hashtag_bar';
import { getHashtagBarForStatus } from 'flavours/glitch/components/hashtag_bar';
import { IconLogo } from 'flavours/glitch/components/logo';
import MediaGallery from 'flavours/glitch/components/media_gallery';
import { MentionsPlaceholder } from 'flavours/glitch/components/mentions_placeholder';
import { Permalink } from 'flavours/glitch/components/permalink';
import { PictureInPicturePlaceholder } from 'flavours/glitch/components/picture_in_picture_placeholder';
import StatusContent from 'flavours/glitch/components/status_content';
import { QuotedStatus } from 'flavours/glitch/components/status_quoted';
import StatusReactions from 'flavours/glitch/components/status_reactions';
import { VisibilityIcon } from 'flavours/glitch/components/visibility_icon';
import { Audio } from 'flavours/glitch/features/audio';
import scheduleIdleTask from 'flavours/glitch/features/ui/util/schedule_idle_task';
import { Video } from 'flavours/glitch/features/video';
import { useIdentity } from 'flavours/glitch/identity_context';
import { visibleReactions } from 'flavours/glitch/initial_state';
import { useAppSelector } from 'flavours/glitch/store';

import Card from './card';

interface VideoModalOptions {
  startTime: number;
  autoPlay?: boolean;
  defaultVolume: number;
}

export const DetailedStatus: React.FC<{
  status: any;
  onOpenMedia?: (status: any, index: number, lang: string) => void;
  onOpenVideo?: (status: any, lang: string, options: VideoModalOptions) => void;
  onTranslate?: (status: any) => void;
  measureHeight?: boolean;
  onHeightChange?: () => void;
  domain: string;
  showMedia?: boolean;
  withLogo?: boolean;
  overrideDisplayName?: React.ReactNode;
  pictureInPicture: any;
  onToggleHidden?: (status: any) => void;
  onToggleMediaVisibility?: () => void;
  onReactionAdd?: (status: any, name: string, url: string) => void;
  onReactionRemove?: (status: any, name: string) => void;
  expanded: boolean;
}> = ({
  status,
  onOpenMedia,
  onOpenVideo,
  onTranslate,
  measureHeight,
  onHeightChange,
  domain,
  showMedia,
  withLogo,
  overrideDisplayName,
  pictureInPicture,
  onToggleMediaVisibility,
  onToggleHidden,
  onReactionAdd,
  onReactionRemove,
  expanded,
}) => {
  const properStatus = status?.get('reblog') ?? status;
  const [height, setHeight] = useState(0);
  const [showDespiteFilter, setShowDespiteFilter] = useState(false);
  const nodeRef = useRef<HTMLDivElement>();
  const { signedIn } = useIdentity();

  const rewriteMentions = useAppSelector(
    (state) => state.local_settings.get('rewrite_mentions', false) as boolean,
  );
  const tagMisleadingLinks = useAppSelector(
    (state) =>
      state.local_settings.get('tag_misleading_links', false) as boolean,
  );
  const letterboxMedia = useAppSelector(
    (state) =>
      state.local_settings.getIn(['media', 'letterbox'], false) as boolean,
  );
  const fullwidthMedia = useAppSelector(
    (state) =>
      state.local_settings.getIn(['media', 'fullwidth'], false) as boolean,
  );

  const handleOpenVideo = useCallback(
    (options: VideoModalOptions) => {
      const lang = (status.getIn(['translation', 'language']) ||
        status.get('language')) as string;
      if (onOpenVideo)
        onOpenVideo(status.getIn(['media_attachments', 0]), lang, options);
    },
    [onOpenVideo, status],
  );

  const handleFilterToggle = useCallback(() => {
    setShowDespiteFilter(!showDespiteFilter);
  }, [showDespiteFilter, setShowDespiteFilter]);

  const handleExpandedToggle = useCallback(() => {
    if (onToggleHidden) onToggleHidden(status);
  }, [onToggleHidden, status]);

  const _measureHeight = useCallback(
    (heightJustChanged?: boolean) => {
      if (measureHeight && nodeRef.current) {
        scheduleIdleTask(() => {
          if (nodeRef.current)
            setHeight(Math.ceil(nodeRef.current.scrollHeight) + 1);
        });

        if (onHeightChange && heightJustChanged) {
          onHeightChange();
        }
      }
    },
    [onHeightChange, measureHeight, setHeight],
  );

  const handleRef = useCallback(
    (c: HTMLDivElement) => {
      nodeRef.current = c;
      _measureHeight();
    },
    [_measureHeight],
  );

  const handleTranslate = useCallback(() => {
    if (onTranslate) onTranslate(status);
  }, [onTranslate, status]);

  if (!properStatus) {
    return null;
  }

  let media;
  let applicationLink;
  let reblogLink;
  let attachmentAspectRatio;

  if (properStatus.get('media_attachments').getIn([0, 'type']) === 'video') {
    attachmentAspectRatio = `${properStatus.get('media_attachments').getIn([0, 'meta', 'original', 'width'])} / ${properStatus.get('media_attachments').getIn([0, 'meta', 'original', 'height'])}`;
  } else if (
    properStatus.get('media_attachments').getIn([0, 'type']) === 'audio'
  ) {
    attachmentAspectRatio = '16 / 9';
  } else {
    attachmentAspectRatio =
      properStatus.get('media_attachments').size === 1 &&
      properStatus
        .get('media_attachments')
        .getIn([0, 'meta', 'small', 'aspect'])
        ? properStatus
            .get('media_attachments')
            .getIn([0, 'meta', 'small', 'aspect'])
        : '3 / 2';
  }

  const mediaIcons: string[] = [];

  const outerStyle = { boxSizing: 'border-box' } as CSSProperties;

  if (measureHeight) {
    outerStyle.height = height;
  }

  const language =
    status.getIn(['translation', 'language']) || status.get('language');

  if (pictureInPicture.get('inUse')) {
    media = <PictureInPicturePlaceholder aspectRatio={attachmentAspectRatio} />;
    mediaIcons.push('video-camera');
  } else if (status.get('media_attachments').size > 0) {
    if (
      status
        .get('media_attachments')
        .some(
          (item: Immutable.Map<string, any>) => item.get('type') === 'unknown',
        )
    ) {
      media = <AttachmentList media={status.get('media_attachments')} />;
    } else if (
      ['image', 'gifv', 'unknown'].includes(
        status.getIn(['media_attachments', 0, 'type']) as string,
      ) ||
      status.get('media_attachments').size > 1
    ) {
      media = (
        <MediaGallery
          standalone
          sensitive={status.get('sensitive')}
          media={status.get('media_attachments')}
          lang={language}
          height={300}
          letterbox={letterboxMedia}
          fullwidth={fullwidthMedia}
          hidden={!expanded}
          onOpenMedia={onOpenMedia}
          visible={showMedia}
          onToggleVisibility={onToggleMediaVisibility}
          matchedFilters={status.get('matched_media_filters')}
        />
      );
      mediaIcons.push('picture-o');
    } else if (status.getIn(['media_attachments', 0, 'type']) === 'audio') {
      const attachment = status.getIn(['media_attachments', 0]);
      const description =
        attachment.getIn(['translation', 'description']) ||
        attachment.get('description');

      media = (
        <Audio
          src={attachment.get('url')}
          alt={description}
          lang={language}
          poster={
            attachment.get('preview_url') ||
            status.getIn(['account', 'avatar_static'])
          }
          duration={attachment.getIn(['meta', 'original', 'duration'], 0)}
          backgroundColor={attachment.getIn(['meta', 'colors', 'background'])}
          foregroundColor={attachment.getIn(['meta', 'colors', 'foreground'])}
          accentColor={attachment.getIn(['meta', 'colors', 'accent'])}
          sensitive={status.get('sensitive')}
          visible={showMedia}
          blurhash={attachment.get('blurhash')}
          onToggleVisibility={onToggleMediaVisibility}
          matchedFilters={status.get('matched_media_filters')}
        />
      );
      mediaIcons.push('music');
    } else if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
      const attachment = status.getIn(['media_attachments', 0]);
      const description =
        attachment.getIn(['translation', 'description']) ||
        attachment.get('description');

      media = (
        <Video
          preview={attachment.get('preview_url')}
          frameRate={attachment.getIn(['meta', 'original', 'frame_rate'])}
          aspectRatio={`${attachment.getIn(['meta', 'original', 'width'])} / ${attachment.getIn(['meta', 'original', 'height'])}`}
          blurhash={attachment.get('blurhash')}
          src={attachment.get('url')}
          alt={description}
          lang={language}
          onOpenVideo={handleOpenVideo}
          sensitive={status.get('sensitive')}
          visible={showMedia}
          onToggleVisibility={onToggleMediaVisibility}
          matchedFilters={status.get('matched_media_filters')}
          letterbox={letterboxMedia}
          fullwidth={fullwidthMedia}
        />
      );
      mediaIcons.push('video-camera');
    }
  } else if (status.get('card') && !status.get('quote')) {
    media = (
      <Card
        sensitive={status.get('sensitive')}
        onOpenMedia={onOpenMedia}
        card={status.get('card')}
      />
    );
    mediaIcons.push('link');
  }

  if (status.get('poll')) {
    mediaIcons.push('tasks');
  }

  if (status.get('application')) {
    applicationLink = (
      <>
        ·
        <a
          className='detailed-status__application'
          href={status.getIn(['application', 'website'])}
          target='_blank'
          rel='noopener noreferrer'
        >
          {status.getIn(['application', 'name'])}
        </a>
      </>
    );
  }

  const visibilityLink = (
    <>
      ·<VisibilityIcon visibility={status.get('visibility')} />
    </>
  );

  if (['private', 'direct'].includes(status.get('visibility') as string)) {
    reblogLink = '';
  } else {
    reblogLink = (
      <Link
        to={`/@${status.getIn(['account', 'acct'])}/${status.get('id')}/reblogs`}
        className='detailed-status__link'
      >
        <span className='detailed-status__reblogs'>
          <AnimatedNumber value={status.get('reblogs_count')} />
        </span>
        <FormattedMessage
          id='status.reblogs'
          defaultMessage='{count, plural, one {boost} other {boosts}}'
          values={{ count: status.get('reblogs_count') }}
        />
      </Link>
    );
  }

  const favouriteLink = (
    <Link
      to={`/@${status.getIn(['account', 'acct'])}/${status.get('id')}/favourites`}
      className='detailed-status__link'
    >
      <span className='detailed-status__favorites'>
        <AnimatedNumber value={status.get('favourites_count')} />
      </span>
      <FormattedMessage
        id='status.favourites'
        defaultMessage='{count, plural, one {favorite} other {favorites}}'
        values={{ count: status.get('favourites_count') }}
      />
    </Link>
  );

  const { statusContentProps, hashtagBar } = getHashtagBarForStatus(
    status as StatusLike,
  );

  const matchedFilters = status.get('matched_filters');

  expanded =
    (!matchedFilters || showDespiteFilter) &&
    (expanded || status.get('spoiler_text').length === 0);

  return (
    <div style={outerStyle}>
      <div
        ref={handleRef}
        className={classNames(
          'detailed-status',
          `detailed-status-${status.get('visibility')}`,
          {
            'status--has-quote': !!status.get('quote'),
          },
        )}
        data-status-by={status.getIn(['account', 'acct'])}
      >
        <Permalink
          to={`/@${status.getIn(['account', 'acct'])}`}
          href={status.getIn(['account', 'url'])}
          data-hover-card-account={status.getIn(['account', 'id'])}
          className='detailed-status__display-name'
        >
          <div className='detailed-status__display-avatar'>
            <Avatar account={status.get('account')} size={46} />
          </div>

          {overrideDisplayName ?? (
            <DisplayName account={status.get('account')} localDomain={domain} />
          )}

          {withLogo && (
            <>
              <div className='spacer' />
              <IconLogo />
            </>
          )}
        </Permalink>

        {matchedFilters && (
          <FilterWarning
            title={matchedFilters.join(', ')}
            expanded={showDespiteFilter}
            onClick={handleFilterToggle}
          />
        )}

        {status.get('spoiler_text').length > 0 &&
          (!matchedFilters || showDespiteFilter) && (
            <ContentWarning
              text={
                status.getIn(['translation', 'spoilerHtml']) ||
                status.get('spoilerHtml')
              }
              expanded={expanded}
              onClick={handleExpandedToggle}
            />
          )}

        {expanded && (
          <>
            <StatusContent
              status={status}
              onTranslate={handleTranslate}
              tagLinks={tagMisleadingLinks}
              rewriteMentions={rewriteMentions}
              {...(statusContentProps as any)}
            />

            {media}
            {hashtagBar}

            {status.get('quote') && (
              <QuotedStatus quote={status.get('quote')} />
            )}
          </>
        )}

        {/* This is a glitch-soc addition to have a placeholder */}
        {!expanded && <MentionsPlaceholder status={status} />}

        {visibleReactions && visibleReactions > 0 && (
          <StatusReactions
            statusId={status.get('id')}
            reactions={status.get('reactions')}
            addReaction={onReactionAdd}
            removeReaction={onReactionRemove}
            canReact={signedIn}
          />
        )}

        <div className='detailed-status__meta'>
          <div className='detailed-status__meta__line'>
            <a
              className='detailed-status__datetime'
              href={status.get('url')}
              target='_blank'
              rel='noopener noreferrer'
            >
              <FormattedDateWrapper
                value={new Date(status.get('created_at') as string)}
                year='numeric'
                month='short'
                day='2-digit'
                hour='2-digit'
                minute='2-digit'
              />
            </a>

            {visibilityLink}
            {applicationLink}
          </div>

          {status.get('edited_at') && (
            <div className='detailed-status__meta__line'>
              <EditedTimestamp
                statusId={status.get('id')}
                timestamp={status.get('edited_at')}
              />
            </div>
          )}

          <div className='detailed-status__meta__line'>
            {reblogLink}
            {reblogLink && <>·</>}
            {favouriteLink}
          </div>
        </div>
      </div>
    </div>
  );
};
