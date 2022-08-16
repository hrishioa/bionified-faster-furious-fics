import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserState = {
  username: string | null;
};

const initialUserState: UserState = {
  username: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUsername: (state, action: PayloadAction<string | null>) => {
      state.username = action.payload;
    },
  },
});

export const { setUsername } = userSlice.actions;
export default userSlice.reducer;