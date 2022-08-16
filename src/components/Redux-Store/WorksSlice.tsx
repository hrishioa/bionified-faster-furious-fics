import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChapterMeta } from 'utils/types';

export type WorkState = {
  chapterInfo: ChapterMeta[];
  currentChapterId: number;
  chapterScrollPercentage: number;
  jumpToChapter: null | number;
};

const initialWorkState: WorkState = {
  chapterInfo: [],
  currentChapterId: 0,
  chapterScrollPercentage: 0,
  jumpToChapter: null
};

const workSlice = createSlice({
  name: 'work',
  initialState: initialWorkState,
  reducers: {
    setChapterMeta: (state, action: PayloadAction<ChapterMeta[]>) => {
      state.chapterInfo = action.payload;
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

export const { setCurrentChapter, setChapterMeta, setScroll, jumpToChapter } =
  workSlice.actions;
export default workSlice.reducer;
