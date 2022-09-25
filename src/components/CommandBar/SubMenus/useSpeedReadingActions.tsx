import { Speedometer } from '@/components/Icons';
import {
  useAppStoreDispatch,
  useAppStoreSelector,
} from '@/components/Redux-Store/hooks';
import { setSpeedReadingMode } from '@/components/Redux-Store/UserSlice';
import { useKBar } from 'kbar';
import React, { useEffect } from 'react';

export default function useSpeedReadingActions() {
  const { query } = useKBar();

  const speedReadingMode = useAppStoreSelector(
    (state) => state.user.displayPreferences.speedReadingMode,
  );
  const dispatch = useAppStoreDispatch();

  useEffect(() => {
    const speedReadingActions = [];

    if (speedReadingMode) {
      speedReadingActions.push({
        id: 'speedReadingMode',
        name: 'Turn Speed Reading Off',
        subtitle: 'Increase opacity on rest areas.',
        keywords: 'speed reading bionic mode',
        section: 'Work',
        icon: (
          <div>
            <Speedometer />
          </div>
        ),
        perform: () => {
          dispatch(setSpeedReadingMode(false));
        },
      });
    } else {
      speedReadingActions.push({
        id: 'speedReadingMode',
        name: 'Turn Speed Reading On',
        subtitle: 'Reduce opacity on rest areas.',
        keywords: 'speed reading bionic mode',
        section: 'Work',
        icon: (
          <div>
            <Speedometer />
          </div>
        ),
        perform: () => {
          dispatch(setSpeedReadingMode(true));
        },
      });
    }

    const deregisterExistingActions =
      query.registerActions(speedReadingActions);

    return () => {
      if (deregisterExistingActions) deregisterExistingActions();
    };
  }, [query, dispatch, speedReadingMode]);
}
