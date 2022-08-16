import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import workReducer from './WorksSlice';
import userReducer from './UserSlice';
import { Provider } from 'react-redux';

export type ReduxStoreProps = {
  children?: JSX.Element | JSX.Element[];
};

const store = configureStore({
  reducer: {
    work: workReducer,
    user: userReducer,
  },
});

export const ReduxStore: React.FC<ReduxStoreProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const getWork = (state: RootState) => state.work;
