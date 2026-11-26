import { AlertsController } from '@/flavours/glitch/components/alerts_controller';
import { ComposeForm } from '@/flavours/glitch/features/compose/form';
import LoadingBarContainer from '@/flavours/glitch/features/ui/containers/loading_bar_container';
import ModalContainer from '@/flavours/glitch/features/ui/containers/modal_container';
import { useConfirmBeforePageClose } from '@/flavours/glitch/hooks/useConfirmBeforePageClose';
import { selectComposerIsChanged } from '@/flavours/glitch/reducers/slices/composer';
import { useAppSelector } from '@/flavours/glitch/store';

export const Compose: React.FC = () => {
  const isComposerChanged = useAppSelector(selectComposerIsChanged);

  useConfirmBeforePageClose(isComposerChanged);

  return (
    <>
      <ComposeForm autoFocus headless redirectOnSuccess />
      <AlertsController />
      <ModalContainer />
      <LoadingBarContainer className='loading-bar' />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default Compose;
