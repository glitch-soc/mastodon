import { AlertsController } from '@/flavours/glitch/components/alerts_controller';
import LoadingBarContainer from '@/flavours/glitch/features/ui/containers/loading_bar_container';
import ModalContainer from '@/flavours/glitch/features/ui/containers/modal_container';

import { RedesignComposeForm } from '../../compose/redesign';

export const Compose: React.FC = () => {
  return (
    <>
      <RedesignComposeForm autoFocus headless redirectOnSuccess />
      <AlertsController />
      <ModalContainer />
      <LoadingBarContainer className='loading-bar' />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default Compose;
