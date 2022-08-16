import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChapterMeta } from 'utils/types';

export type WorkState = {
  chapterInfo: ChapterMeta[];
  currentChapterId: number;
  chapterScrollPercentage: number;
};

const initialWorkState: WorkState = {
  chapterInfo: [],
  currentChapterId: 0,
  chapterScrollPercentage: 0,
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
    setScroll: (
      state,
      action: PayloadAction<{ chapterId: number; scrollPercentage: number }>,
    ) => {
      state.currentChapterId = action.payload.chapterId;
      state.chapterScrollPercentage = action.payload.scrollPercentage;
    },
  },
});

export const getCurrentChapterName = (state: WorkState) => {
  const matchingChapter = state.chapterInfo.find(
    (chapter) => chapter.id === state.currentChapterId,
  );
  if (matchingChapter) return matchingChapter.title;
  else return null;
};

export const { setCurrentChapter, setChapterMeta, setScroll } =
  workSlice.actions;
export default workSlice.reducer;
