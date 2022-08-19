import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChapterMeta, WorkInfo } from 'utils/types';

export type WorkState = {
  workInfo: WorkInfo | null;
  chapterInfo: ChapterMeta[];
  currentChapterId: number;
  chapterScrollPercentage: number;
  jumpToChapter: null | number;
};

const initialWorkState: WorkState = {
  workInfo: null,
  chapterInfo: [],
  currentChapterId: 0,
  chapterScrollPercentage: 0,
  jumpToChapter: null,
};

const workSlice = createSlice({
  name: 'work',
  initialState: initialWorkState,
  reducers: {
    setChapterMeta: (state, action: PayloadAction<ChapterMeta[]>) => {
      state.chapterInfo = action.payload;
    },
    setSubscribeStatus: (state, action: PayloadAction<number | null>) => {
      if (state.workInfo) state.workInfo.subscribeId = action.payload;
    },
    setWorkInfo: (state, action: PayloadAction<WorkInfo>) => {
      console.log('Setting work info to ', action.payload);
      state.workInfo = action.payload;
    },
    setCurrentChapter: (state, action: PayloadAction<number>) => {
      state.currentChapterId = action.payload;
    },
    jumpToChapter: (state, action: PayloadAction<number | null>) => {
      state.jumpToChapter = action.payload;
    },
    setScroll: (
      state,
      action: PayloadAction<{ chapterId: number; scrollPercentage: number }>,
    ) => {
      state.currentChapterId = action.payload.chapterId;
      state.chapterScrollPercentage = action.payload.scrollPercentage;
    },
  },
});

export const {
  setCurrentChapter,
  setSubscribeStatus,
  setChapterMeta,
  setScroll,
  jumpToChapter,
  setWorkInfo,
} = workSlice.actions;
export default workSlice.reducer;
