import { Subscribe, Unsubscribe } from '@/components/Icons';
import { useAppStoreDispatch, useAppStoreSelector } from '@/components/Redux-Store/hooks';
import { appStore, ReduxStore } from '@/components/Redux-Store/ReduxStore';
import { setSubscribeStatus } from '@/components/Redux-Store/WorksSlice';
import { useKBar, useRegisterActions } from 'kbar';
import React, { useEffect, useState } from 'react';

export default function useSubscribeActions() {
  const { query } = useKBar();

  const workInfo = useAppStoreSelector((state) => state.work.workInfo);

  console.log('loading subscribe actions, workinfo is ', workInfo);

  useEffect(() => {
    const subAction =
      (workInfo && [
        workInfo.subscribeId
          ? {
              id: 'sub',
              priority: 0,
              name: 'Unsubscribe (Work In Progress)',
              icon: (
                <>
                  <Unsubscribe />
                </>
              ),
              keywords: 'unsubscribe',
              perform: async () => {
                const response = await window.fetch('/api/subscribe', {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                  },
                  body: JSON.stringify({
                    username: workInfo.username,
                    authenticityToken: workInfo.authenticityToken,
                    workId: workInfo.id,
                    type: 'unsubscribe',
                    subscriptionId: workInfo.subscribeId,
                  }),
                });

                console.log('Unsubscribe got status ', response.status);

                const data = await response.json();
                console.log('Got data ', data);

                console.log('Setting subscribe status to nothing');
                appStore.dispatch(setSubscribeStatus(null));
              },
              section: 'Work',
            }
          : {
              id: 'sub',
              priority: 0,
              name: 'Subscribe (Work In Progress)',
              icon: (
                <>
                  <Subscribe />
                </>
              ),
              perform: async () => {
                const response = await window.fetch('/api/subscribe', {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                  },
                  body: JSON.stringify({
                    username: workInfo.username,
                    authenticityToken: workInfo.authenticityToken,
                    workId: workInfo.id,
                    type: 'subscribe',
                  }),
                });

                console.log('Subscribe got status ', response.status);

                const data = await response.json();
                console.log('Got data ', data);

                if(data.success && data.subscriptionId && !isNaN(parseInt(data.subscriptionId)))
                  console.log('Setting subscribe status to ', parseInt(data.subscriptionId));
                  appStore.dispatch(setSubscribeStatus(parseInt(data.subscriptionId)));
              },
              keywords: 'subscribe',
              section: 'Work',
            },
      ]) ||
      null;

    console.log('Sub action is ', subAction);

    const deregisterExistingActions = subAction && query.registerActions(subAction) || null;

    return () => {
      if(deregisterExistingActions)
        deregisterExistingActions();
    }
  }, [query, workInfo]);

  // useRegisterActions(subAction);
}
