import { useCallback } from 'react';
import type { FC } from 'react';

import { openModal } from '@/flavours/glitch/actions/modal';
import { useDismissible } from '@/flavours/glitch/hooks/useDismissible';
import { generateReport } from '@/flavours/glitch/reducers/slices/annual_report';
import { useAppDispatch, useAppSelector } from '@/flavours/glitch/store';

import { AnnualReportAnnouncement } from './announcement';

export const AnnualReportTimeline: FC = () => {
  const { state, year } = useAppSelector((state) => state.annualReport);

  const dispatch = useAppDispatch();
  const handleBuildRequest = useCallback(() => {
    void dispatch(generateReport());
  }, [dispatch]);

  const { wasDismissed, dismiss } = useDismissible(
    `annual_report_announcement_${year}`,
  );

  const handleOpen = useCallback(() => {
    dispatch(openModal({ modalType: 'ANNUAL_REPORT', modalProps: {} }));
    dismiss();
  }, [dismiss, dispatch]);

  if (!year || wasDismissed || !state || state === 'ineligible') {
    return null;
  }

  return (
    <AnnualReportAnnouncement
      year={year.toString()}
      state={state}
      onRequestBuild={handleBuildRequest}
      onOpen={handleOpen}
      onDismiss={dismiss}
    />
  );
};
