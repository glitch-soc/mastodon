import classNames from 'classnames';

import { ComposeRedesignButton } from '@/flavours/glitch/features/compose/redesign/trigger';
import { RedesignNavigationPanel } from '@/flavours/glitch/features/navigation_panel/redesign';
import { RedesignMobileNavigation } from '@/flavours/glitch/features/navigation_panel/redesign/mobile_nav';
import { useAppSelector } from '@/flavours/glitch/store';
import { Footer } from 'flavours/glitch/features/custom_homepage/components/footer';
import { Header } from 'flavours/glitch/features/custom_homepage/components/header';

import { useBreakpoint } from '../../hooks/useBreakpoint';

import { MultiColumnContent } from './multi_column_content';
import classes from './redesign.module.scss';

export const ColumnsAreaRedesign: React.FC<{
  singleColumn?: boolean;
  minimalShell?: boolean;
  children: React.ReactElement | React.ReactElement[];
  ref?: React.Ref<HTMLDivElement>;
}> = ({ children, minimalShell, singleColumn, ref }) => {
  const isModalOpen = useAppSelector(
    (state) => !state.modal.get('stack').isEmpty(),
  );
  const isMobile = useBreakpoint('openable');

  if (minimalShell) {
    return (
      <div className={classes.root}>
        <div className={classes.main}>
          <Header />

          <div className={classes.content}>{children}</div>

          <Footer />
        </div>
      </div>
    );
  }

  if (singleColumn) {
    return (
      <div className={classes.root}>
        <div className={classes.navigationWrapper}>
          <RedesignNavigationPanel />
        </div>
        {isMobile ? <RedesignMobileNavigation /> : <ComposeRedesignButton />}

        <main className={classes.main}>{children}</main>
      </div>
    );
  }

  return (
    <main
      className={classNames('columns-area', { unscrollable: isModalOpen })}
      ref={ref}
      tabIndex={isModalOpen ? undefined : 0}
    >
      <MultiColumnContent>{children}</MultiColumnContent>
    </main>
  );
};
