import { useKBar, useRegisterActions } from 'kbar';
import { useEffect } from 'react';

export default function useDetectFontSize() {
  const { query, search, rootActionId, actions } = useKBar((state) => ({
    search: state.searchQuery,
    rootActionId: state.currentRootActionId,
    actions: state.actions,
  }));

  useEffect(() => {
    console.log('QSA changed - ', {query, rootActionId, search, actions});
  }, [query, search, actions, rootActionId]);

  useEffect(() => {
    if (rootActionId === 'fontsize') {
      console.log('Font size mode activated');
    } else {
      console.log('Font size mode deactivated');
    }
  }, [rootActionId]);

  useEffect(() => {
    let unregister: null | (() => void) = null;

    if (rootActionId === 'fontsize') {
      console.log('query changed to ', search, ' while font size mode active');
      unregister = query.registerActions([
        {
          id: 'fontsize',
          name: 'Font Size',
          keywords: 'interface font size',
          section: 'Preferences',
        },
        {
          id: String(search),
          name: `Font Size ${search}`,
          parent: 'fontsize',
        },
      ]);
    }

    return () => {
      if (unregister) {
        console.log('Unregistering...');
        console.log('Returned - ',unregister());
      }
    };
  }, [search]);

  return;
}
