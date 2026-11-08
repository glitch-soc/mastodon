import { useCallback } from 'react';

import { FormattedMessage } from 'react-intl';

import {
  MarkdownLogoIcon,
  WifiSlashIcon,
  YarnIcon,
} from '@phosphor-icons/react';

import {
  changeComposeContentType,
  changeComposeAdvancedOption,
} from '@/flavours/glitch/actions/compose';
import {
  MenuItem,
  MenuItemCheckbox,
  MenuItemGroup,
} from '@/flavours/glitch/components/menu';
import {
  useAppDispatch,
  useAppSelector,
} from '@/flavours/glitch/store/typed_functions';

export const GlitchSettings: React.FC = () => {
  const contentType = useAppSelector((state) =>
    state.compose.get('content_type'),
  );
  const localOnly = useAppSelector(
    (state) => !!state.compose.getIn(['advanced_options', 'do_not_federate']),
  );
  const threadedMode = useAppSelector(
    (state) => !!state.compose.getIn(['advanced_options', 'threaded_mode']),
  );

  const dispatch = useAppDispatch();

  const onMarkdownChange = useCallback(() => {
    dispatch(
      changeComposeContentType(
        contentType === 'text/plain' ? 'text/markdown' : 'text/plain',
      ),
    );
  }, [contentType, dispatch]);

  const onLocalOnlyChange = useCallback(() => {
    dispatch(changeComposeAdvancedOption('do_not_federate', !localOnly));
  }, [localOnly, dispatch]);

  const onThreadedModeChange = useCallback(() => {
    dispatch(changeComposeAdvancedOption('threaded_mode', !threadedMode));
  }, [threadedMode, dispatch]);

  return (
    <MenuItemGroup
      label={
        <FormattedMessage
          id='compose.glitch_settings.label'
          defaultMessage='glitch-soc settings'
        />
      }
    >
      <MenuItemCheckbox
        name='markdown_formatting'
        value='on'
        checked={contentType === 'text/markdown'}
        onChange={onMarkdownChange}
        keepMenuOpenOnClick
        icon={MarkdownLogoIcon}
      >
        <FormattedMessage
          id='compose.glitch.use_markdown'
          defaultMessage='Use Markdown formatting'
        />
      </MenuItemCheckbox>
      <MenuItemCheckbox
        name='local_only'
        value='on'
        checked={localOnly}
        onChange={onLocalOnlyChange}
        keepMenuOpenOnClick
        icon={WifiSlashIcon}
      >
        <FormattedMessage
          id='compose.glitch.local_only'
          defaultMessage='This server only'
        />
      </MenuItemCheckbox>
      <MenuItemCheckbox
        name='threaded_mode'
        value='on'
        checked={threadedMode}
        onChange={onThreadedModeChange}
        keepMenuOpenOnClick
        icon={YarnIcon}
      >
        <FormattedMessage
          id='compose.glitch.threaded_mode'
          defaultMessage='Threaded mode'
        />
      </MenuItemCheckbox>
    </MenuItemGroup>
  );
};
