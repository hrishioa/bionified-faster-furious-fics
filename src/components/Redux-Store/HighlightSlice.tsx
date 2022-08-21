import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clarifyAndGetSelection,
  makeDocumentSelection,
  updateGlobalSavedHighlights,
} from 'utils/highlight';
import { Highlight } from 'utils/types';

export type HighlightState = {
  currentSelection: Highlight | null;
  highlights: Highlight[];
};

const initialHighlightState: HighlightState = {
  currentSelection: null,
  highlights: [],
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
        state.highlights.length,
      );

      state.currentSelection = highlight;
    },
    selectSavedHighlight: (state, action: PayloadAction<number>) => {
      if (action.payload > 0 && action.payload < state.highlights.length) {
        const selectedHighlight = state.highlights[action.payload];
        console.log('Showing ', selectedHighlight);
        state.currentSelection = selectedHighlight;

        makeDocumentSelection(
          selectedHighlight.chapterId,
          selectedHighlight.startTag,
          selectedHighlight.endTag,
        );
      }
    },
    saveHighlight: (state, action: PayloadAction<Highlight>) => {
      state.highlights.push(action.payload);
      updateGlobalSavedHighlights(state.highlights);
    },
    deleteHighlight: (state, action: PayloadAction<Highlight>) => {
      state.highlights = state.highlights.filter(
        (highlight) =>
          highlight.startTag !== action.payload.startTag ||
          highlight.endTag !== action.payload.endTag,
      );
    },
  },
});

export const {
  highlightChanged,
  saveHighlight,
  deleteHighlight,
  selectSavedHighlight,
} = highlightSlice.actions;
export default highlightSlice.reducer;
