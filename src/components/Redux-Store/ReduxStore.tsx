import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import workReducer from './WorksSlice';
import userReducer from './UserSlice';
import highlightReducer from './HighlightSlice';
import { Provider } from 'react-redux';

export type ReduxStoreProps = {
  children?: JSX.Element | JSX.Element[];
};

export const appStore = configureStore({
  reducer: {
    work: workReducer,
    user: userReducer,
    highlight: highlightReducer,
  },
});

export const ReduxStore: React.FC<ReduxStoreProps> = ({ children }) => {
  return <Provider store={appStore}>{children}</Provider>;
};

export type RootState = ReturnType<typeof appStore.getState>;
export type AppDispatch = typeof appStore.dispatch;

export const getWork = (state: RootState) => state.work;
