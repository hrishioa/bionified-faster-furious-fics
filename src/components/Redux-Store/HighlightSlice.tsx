import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clarifyAndGetSelection, updateGlobalSavedHighlights } from 'utils/highlight';
import { Highlight } from 'utils/types';

export type HighlightState = {
  currentSelection: Highlight | null;
  highlights: Highlight[];
};

const initialHighlightState: HighlightState = {
  currentSelection: null,
  highlights: []
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
    saveHighlight: (state, action: PayloadAction<Highlight>) => {
      state.highlights.push(action.payload);
      updateGlobalSavedHighlights(state.highlights);
    }
  },
});

export const { highlightChanged, saveHighlight } = highlightSlice.actions;
export default highlightSlice.reducer;
