/* eslint-disable @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-explicit-any,
                  @typescript-eslint/no-unsafe-assignment */

import type { CSSProperties } from 'react';
import { useState, useRef, useCallback } from 'react';

import { FormattedDate, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { AnimatedNumber } from 'flavours/glitch/components/animated_number';
import AttachmentList from 'flavours/glitch/components/attachment_list';
import EditedTimestamp from 'flavours/glitch/components/edited_timestamp';
import type { StatusLike } from 'flavours/glitch/components/hashtag_bar';
import { getHashtagBarForStatus } from 'flavours/glitch/components/hashtag_bar';
import { IconLogo } from 'flavours/glitch/components/logo';
import { Permalink } from 'flavours/glitch/components/permalink';
import PictureInPicturePlaceholder from 'flavours/glitch/components/picture_in_picture_placeholder';
import { useAppHistory } from 'flavours/glitch/components/router';
import { VisibilityIcon } from 'flavours/glitch/components/visibility_icon';
import PollContainer from 'flavours/glitch/containers/poll_container';
import { useAppSelector } from 'flavours/glitch/store';

import { Avatar } from '../../../components/avatar';
import { DisplayName } from '../../../components/display_name';
import MediaGallery from '../../../components/media_gallery';
import StatusContent from '../../../components/status_content';
import Audio from '../../audio';
import scheduleIdleTask from '../../ui/util/schedule_idle_task';
import Video from '../../video';

import Card from './card';

interface VideoModalOptions {
  startTime: number;
  autoPlay?: boolean;
  defaultVolume: number;
  componentIndex: number;
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
  pictureInPicture: any;
  onToggleHidden?: (status: any) => void;
  onToggleMediaVisibility?: () => void;
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
  pictureInPicture,
  onToggleMediaVisibility,
  onToggleHidden,
  expanded,
}) => {
  const properStatus = status?.get('reblog') ?? status;
  const [height, setHeight] = useState(0);
  const nodeRef = useRef<HTMLDivElement>();
  const history = useAppHistory();

  const rewriteMentions = useAppSelector(
    (state) => state.local_settings.get('rewrite_mentions', false) as boolean,
  );
  const tagMisleadingLinks = useAppSelector(
    (state) =>
      state.local_settings.get('tag_misleading_links', false) as boolean,
  );
  const mediaOutsideCW = useAppSelector(
    (state) =>
      state.local_settings.getIn(
        ['content_warnings', 'media_outside'],
        false,
      ) as boolean,
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

  const handleChildUpdate = useCallback(() => {
    _measureHeight();
  }, [_measureHeight]);

  const handleTranslate = useCallback(() => {
    if (onTranslate) onTranslate(status);
  }, [onTranslate, status]);

  const parseClick = useCallback(
    (e: React.MouseEvent, destination: string) => {
      if (e.button === 0 && !(e.ctrlKey || e.altKey || e.metaKey)) {
        e.preventDefault();
        history.push(destination);
      }

      e.stopPropagation();
    },
    [history],
  );

  if (!properStatus) {
    return null;
  }

  let applicationLink;
  let reblogLink;

  //  Depending on user settings, some media are considered as parts of the
  //  contents (affected by CW) while other will be displayed outside of the
  //  CW.
  const contentMedia: React.ReactNode[] = [];
  const contentMediaIcons: string[] = [];
  const extraMedia: React.ReactNode[] = [];
  const extraMediaIcons: string[] = [];
  let media = contentMedia;
  let mediaIcons: string[] = contentMediaIcons;

  if (mediaOutsideCW) {
    media = extraMedia;
    mediaIcons = extraMediaIcons;
  }

  const outerStyle = { boxSizing: 'border-box' } as CSSProperties;

  if (measureHeight) {
    outerStyle.height = height;
  }

  const language =
    status.getIn(['translation', 'language']) || status.get('language');

  if (pictureInPicture.get('inUse')) {
    media.push(<PictureInPicturePlaceholder />);
    mediaIcons.push('video-camera');
  } else if (status.get('media_attachments').size > 0) {
    if (
      status
        .get('media_attachments')
        .some(
          (item: Immutable.Map<string, any>) => item.get('type') === 'unknown',
        )
    ) {
      media.push(<AttachmentList media={status.get('media_attachments')} />);
    } else if (
      ['image', 'gifv'].includes(
        status.getIn(['media_attachments', 0, 'type']) as string,
      ) ||
      status.get('media_attachments').size > 1
    ) {
      media.push(
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
        />,
      );
      mediaIcons.push('picture-o');
    } else if (status.getIn(['media_attachments', 0, 'type']) === 'audio') {
      const attachment = status.getIn(['media_attachments', 0]);
      const description =
        attachment.getIn(['translation', 'description']) ||
        attachment.get('description');

      media.push(
        <Audio
          src={attachment.get('url')}
          alt={description}
          lang={language}
          duration={attachment.getIn(['meta', 'original', 'duration'], 0)}
          poster={
            attachment.get('preview_url') ||
            status.getIn(['account', 'avatar_static'])
          }
          backgroundColor={attachment.getIn(['meta', 'colors', 'background'])}
          foregroundColor={attachment.getIn(['meta', 'colors', 'foreground'])}
          accentColor={attachment.getIn(['meta', 'colors', 'accent'])}
          sensitive={status.get('sensitive')}
          visible={showMedia}
          blurhash={attachment.get('blurhash')}
          height={150}
          onToggleVisibility={onToggleMediaVisibility}
        />,
      );
      mediaIcons.push('music');
    } else if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
      const attachment = status.getIn(['media_attachments', 0]);
      const description =
        attachment.getIn(['translation', 'description']) ||
        attachment.get('description');

      media.push(
        <Video
          preview={attachment.get('preview_url')}
          frameRate={attachment.getIn(['meta', 'original', 'frame_rate'])}
          aspectRatio={`${attachment.getIn(['meta', 'original', 'width'])} / ${attachment.getIn(['meta', 'original', 'height'])}`}
          blurhash={attachment.get('blurhash')}
          src={attachment.get('url')}
          alt={description}
          lang={language}
          inline
          width={300}
          height={150}
          onOpenVideo={handleOpenVideo}
          sensitive={status.get('sensitive')}
          visible={showMedia}
          onToggleVisibility={onToggleMediaVisibility}
          letterbox={letterboxMedia}
          fullwidth={fullwidthMedia}
          preventPlayback={!expanded}
        />,
      );
      mediaIcons.push('video-camera');
    }
  } else if (status.get('spoiler_text').length === 0) {
    media.push(
      <Card
        sensitive={status.get('sensitive')}
        onOpenMedia={onOpenMedia}
        card={status.get('card', null)}
      />,
    );
    mediaIcons.push('link');
  }

  if (status.get('poll')) {
    contentMedia.push(
      <PollContainer
        pollId={status.get('poll')}
        // @ts-expect-error -- Poll/PollContainer is not typed yet
        lang={status.get('language')}
      />,
    );
    contentMediaIcons.push('tasks');
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
  contentMedia.push(hashtagBar);

  return (
    <div style={outerStyle}>
      <div
        ref={handleRef}
        className={classNames(
          'detailed-status',
          `detailed-status-${status.get('visibility')}`,
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
          <DisplayName account={status.get('account')} localDomain={domain} />
          {withLogo && (
            <>
              <div className='spacer' />
              <IconLogo />
            </>
          )}
        </Permalink>

        <StatusContent
          status={status}
          media={contentMedia}
          extraMedia={extraMedia}
          mediaIcons={contentMediaIcons}
          expanded={expanded}
          collapsed={false}
          onExpandedToggle={onToggleHidden}
          onTranslate={handleTranslate}
          onUpdate={handleChildUpdate}
          tagLinks={tagMisleadingLinks}
          rewriteMentions={rewriteMentions}
          parseClick={parseClick}
          disabled
          {...(statusContentProps as any)}
        />

        <div className='detailed-status__meta'>
          <div className='detailed-status__meta__line'>
            <a
              className='detailed-status__datetime'
              href={status.get('url')}
              target='_blank'
              rel='noopener noreferrer'
            >
              <FormattedDate
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
