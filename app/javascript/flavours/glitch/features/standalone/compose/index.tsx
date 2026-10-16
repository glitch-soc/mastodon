import { lazy, Suspense } from 'react';

import { AlertsController } from '@/flavours/glitch/components/alerts_controller';
import { LoadingIndicator } from '@/flavours/glitch/components/loading_indicator';
import ComposeFormContainer from '@/flavours/glitch/features/compose/containers/compose_form_container';
import LoadingBarContainer from '@/flavours/glitch/features/ui/containers/loading_bar_container';
import ModalContainer from '@/flavours/glitch/features/ui/containers/modal_container';
import { isRedesignEnabled } from '@/flavours/glitch/utils/environment';

const ComposeLazyForm = lazy(() =>
  import('@/flavours/glitch/features/compose/redesign/index').then(
    ({ RedesignComposeForm }) => ({
      default: RedesignComposeForm,
    }),
  ),
);

export const Compose: React.FC = () => {
  return (
    <>
      {isRedesignEnabled() ? (
        <RedesignCompose />
      ) : (
        <ComposeFormContainer autoFocus withoutNavigation redirectOnSuccess />
      )}
      <AlertsController />
      <ModalContainer />
      <LoadingBarContainer className='loading-bar' />
    </>
  );
};

const RedesignCompose: React.FC = () => {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <ComposeLazyForm autoFocus headless redirectOnSuccess />
    </Suspense>
  );
};

// eslint-disable-next-line import/no-default-export
export default Compose;
