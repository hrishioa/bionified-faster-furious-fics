import { Collapse, Focus } from '@/components/Icons';
import {
  useAppStoreDispatch,
  useAppStoreSelector,
} from '@/components/Redux-Store/hooks';
import {
  setFocusMode,
  setMetaDisplayState,
} from '@/components/Redux-Store/UserSlice';
import { useKBar } from 'kbar';
import React, { useEffect } from 'react';

export default function useFocusActions() {
  const { query } = useKBar();

  const displayPreferences = useAppStoreSelector(
    (state) => state.user.displayPreferences,
  );
  const dispatch = useAppStoreDispatch();

  useEffect(() => {
    const focusActions = [];

    if (displayPreferences.focusMode) {
      focusActions.push({
        id: 'focusMode',
        name: 'Focus Mode Off',
        subtitle: 'Show more than just the work content.',
        keywords: 'focus mode',
        section: 'Work',
        icon: (
          <div>
            <Focus />
          </div>
        ),
        perform: () => {
          dispatch(setFocusMode(false));
        },
      });
    } else {
      focusActions.push({
        id: 'focusMode',
        name: 'Focus Mode',
        subtitle: 'See just the work content.',
        keywords: 'focus mode',
        section: 'Work',
        icon: (
          <div>
            <Focus />
          </div>
        ),
        perform: () => {
          dispatch(setFocusMode(true));
        },
      });

      if (displayPreferences.allMetaDisplayState === 'collapsed') {
        focusActions.push({
          id: 'collapseAllNotes',
          name: 'Expand All Summaries & Notes',
          keywords: 'expand notes summary summaries',
          section: 'Work',
          icon: (
            <div>
              <Collapse />
            </div>
          ),
          perform: () => {
            dispatch(setMetaDisplayState('expanded'));
          },
        });
      } else {
        focusActions.push({
          id: 'collapseAllNotes',
          name: 'Collapse All Summaries & Notes',
          keywords: 'collapse notes summary summaries',
          section: 'Work',
          icon: (
            <div>
              <Collapse />
            </div>
          ),
          perform: () => {
            dispatch(setMetaDisplayState('collapsed'));
          },
        });
      }
    }

    const deregisterExistingActions = query.registerActions(focusActions);

    return () => {
      if (deregisterExistingActions) deregisterExistingActions();
    };
  }, [
    query,
    dispatch,
    displayPreferences.focusMode,
    displayPreferences.allMetaDisplayState,
  ]);
}
