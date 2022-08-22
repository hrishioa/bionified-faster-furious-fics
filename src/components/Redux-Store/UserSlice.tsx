import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MetaDisplayState } from './WorksSlice';

export type UserState = {
  username: string | null;
  authenticity_token: string | null;
  displayPreferences: {
    allMetaDisplayState: MetaDisplayState;
    focusMode: boolean;
  };
};

const initialUserState: UserState = {
  username: null,
  authenticity_token: null,
  displayPreferences: {
    allMetaDisplayState: null,
    focusMode: false,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUsername: (state, action: PayloadAction<string | null>) => {
      state.username = action.payload;
    },
    setFocusMode: (state, action: PayloadAction<boolean>) => {
      state.displayPreferences.focusMode = action.payload;
    },
    setMetaDisplayState: (state, action: PayloadAction<MetaDisplayState>) => {
      state.displayPreferences.allMetaDisplayState = action.payload;
    },
    login: (
      state,
      action: PayloadAction<{ username: string; authenticity_token: string }>,
    ) => {
      state.username = action.payload.username;
      state.authenticity_token = action.payload.authenticity_token;
    },
    logout: (state) => {
      state.username = null;
      state.authenticity_token = null;
    },
  },
});

export const { setUsername, login, logout, setFocusMode, setMetaDisplayState } =
  userSlice.actions;
export default userSlice.reducer;
