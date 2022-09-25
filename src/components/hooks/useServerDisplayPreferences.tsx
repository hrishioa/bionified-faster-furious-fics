import { useEffect } from 'react';
import { saveDisplayPreferences } from 'utils/server';
import { useAppStoreDispatch, useAppStoreSelector } from '../Redux-Store/hooks';
import { setServerSynced } from '../Redux-Store/UserSlice';

export function useServerDisplayPreferences() {
  const serverSynced = useAppStoreSelector(
    (state) => state.user.server?.synced,
  );
  const displayPreferences = useAppStoreSelector(
    (state) => state.user.displayPreferences,
  );
  const username = useAppStoreSelector((state) => state.user.username);
  const deviceId = useAppStoreSelector((state) => state.user.server?.deviceId);
  const dispatch = useAppStoreDispatch();

  useEffect(() => {
    if (serverSynced === false && username && deviceId) {
      saveDisplayPreferences(username, deviceId, displayPreferences);
      dispatch(setServerSynced());
    }
  }, [serverSynced, username, deviceId, displayPreferences, dispatch]);
}
