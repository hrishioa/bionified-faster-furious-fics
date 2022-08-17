import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { stringify } from 'querystring';

export type UserState = {
  username: string | null;
  authenticity_token: string | null;
};

const initialUserState: UserState = {
  username: null,
  authenticity_token: null
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUsername: (state, action: PayloadAction<string | null>) => {
      state.username = action.payload;
    },
    login: (state, action: PayloadAction<{username: string, authenticity_token: string}>) => {
      state.username = action.payload.username;
      state.authenticity_token = action.payload.authenticity_token;
    },
    logout: (state) => {
      state.username = null;
      state.authenticity_token = null;
    }
  },
});

export const { setUsername, login, logout } = userSlice.actions;
export default userSlice.reducer;
