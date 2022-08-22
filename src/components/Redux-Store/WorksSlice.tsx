import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChapterMeta, WorkInfo } from 'utils/types';

export type MetaDisplayState = 'collapsed' | 'expanded' | null;

export type ChapterInfoDict = { [key: number]: ChapterMeta };

export type WorkState = {
  workInfo: WorkInfo | null;
  chapterInfo: ChapterInfoDict;
  currentChapterId: number;
  chapterScrollPercentage: number;
  jumpToChapter: null | number;
};

const initialWorkState: WorkState = {
  workInfo: null,
  chapterInfo: {},
  currentChapterId: 0,
  chapterScrollPercentage: 0,
  jumpToChapter: null,
};

const workSlice = createSlice({
  name: 'work',
  initialState: initialWorkState,
  reducers: {
    setChapterMeta: (state, action: PayloadAction<ChapterMeta[]>) => {
      state.chapterInfo = action.payload.reduce((acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      }, {} as ChapterInfoDict);
    },
    setSubscribeStatus: (state, action: PayloadAction<number | null>) => {
      if (state.workInfo) state.workInfo.subscribeId = action.payload;
    },
    setWorkInfo: (state, action: PayloadAction<WorkInfo>) => {
      state.workInfo = action.payload;
    },
    setCurrentChapter: (state, action: PayloadAction<number>) => {
      state.currentChapterId = action.payload;
    },
    jumpToChapter: (state, action: PayloadAction<number | null>) => {
      state.jumpToChapter = action.payload;
    },
    addKudos: (state) => {
      if (state.workInfo)
        state.workInfo.kudos = state.workInfo.kudos
          ? state.workInfo.kudos + 1
          : 1;
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
  addKudos,
} = workSlice.actions;
export default workSlice.reducer;
