import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './ReduxStore';

export const useAppStoreDispatch: () => AppDispatch = useDispatch;
export const useAppStoreSelector: TypedUseSelectorHook<RootState> = useSelector;
