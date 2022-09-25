import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ColorTheme } from 'utils/types';
import { MetaDisplayState } from './WorksSlice';

export type DisplayPreferences = {
  allMetaDisplayState: MetaDisplayState;
  focusMode: boolean;
  speedReadingMode: boolean;
  theme: ColorTheme;
};

export type UserState = {
  username: string | null;
  authenticity_token: string | null;
  server: {
    deviceId: string;
    synced: boolean;
  } | null;
  displayPreferences: DisplayPreferences;
};

export const initialDisplayPreferences: DisplayPreferences = {
  allMetaDisplayState: null,
  focusMode: false,
  speedReadingMode: true,
  theme: 'light',
};

const initialUserState: UserState = {
  username: null,
  server: null,
  authenticity_token: null,
  displayPreferences: initialDisplayPreferences,
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    loadServerDisplayPreferences: (
      state,
      action: PayloadAction<{
        deviceId: string;
        displayPreferences: DisplayPreferences | null;
      }>,
    ) => {
      state.server = {
        deviceId: action.payload.deviceId,
        synced: true,
      };

      if (action.payload.displayPreferences) {
        state.displayPreferences.speedReadingMode =
          !!action.payload.displayPreferences.speedReadingMode;
        state.displayPreferences.theme =
          action.payload.displayPreferences.theme;
        state.displayPreferences.allMetaDisplayState =
          action.payload.displayPreferences.allMetaDisplayState;
        state.displayPreferences.focusMode =
          action.payload.displayPreferences.focusMode;
      }
    },
    setServerSynced: (state) => {
      if (state.server && !state.server.synced) state.server.synced = true;
    },
    setSpeedReadingMode: (state, action: PayloadAction<boolean>) => {
      state.displayPreferences.speedReadingMode = action.payload;

      if (state.server) state.server.synced = false;
    },
    setTheme: (state, action: PayloadAction<ColorTheme>) => {
      state.displayPreferences.theme = action.payload;

      if (state.server) state.server.synced = false;
    },
    setUsername: (state, action: PayloadAction<string | null>) => {
      state.username = action.payload;
    },
    setFocusMode: (state, action: PayloadAction<boolean>) => {
      state.displayPreferences.focusMode = action.payload;

      if (state.server) state.server.synced = false;
    },
    setMetaDisplayState: (state, action: PayloadAction<MetaDisplayState>) => {
      state.displayPreferences.allMetaDisplayState = action.payload;

      if (state.server) state.server.synced = false;
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

export const {
  setUsername,
  login,
  logout,
  setFocusMode,
  setMetaDisplayState,
  setSpeedReadingMode,
  setTheme,
  setServerSynced,
  loadServerDisplayPreferences,
} = userSlice.actions;
export default userSlice.reducer;
