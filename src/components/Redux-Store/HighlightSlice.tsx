import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clarifyAndGetSelection } from 'utils/highlight';
import { Highlight } from 'utils/types';

export type HighlightState = {
  currentSelection: Highlight | null;
};

const initialHighlightState: HighlightState = {
  currentSelection: null,
};

const highlightSlice = createSlice({
  name: 'highlight',
  initialState: initialHighlightState,
  reducers: {
    highlightChanged: (
      state,
      action: PayloadAction<{ selectedHTML: string; chapterId: number }>,
    ) => {
      const highlight = clarifyAndGetSelection(
        action.payload.selectedHTML,
        action.payload.chapterId,
      );

      state.currentSelection = highlight;
    },
  },
});

export const { highlightChanged } = highlightSlice.actions;
export default highlightSlice.reducer;
