import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clarifyAndGetSelection,
  makeDocumentSelection,
  updateGlobalSavedHighlights,
} from 'utils/highlight';
import { Highlight, SavedHighlights } from 'utils/types';

export type HighlightState = {
  currentSelection: Highlight | null;
  highlights: SavedHighlights;
};

const initialHighlightState: HighlightState = {
  currentSelection: null,
  highlights: {},
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
        Object.keys(state.highlights).length,
      );

      state.currentSelection = highlight;
    },
    selectSavedHighlight: (state, action: PayloadAction<number>) => {
      const selectedHighlight = state.highlights[action.payload];

      if (selectedHighlight) {
        state.currentSelection = selectedHighlight;

        makeDocumentSelection(
          selectedHighlight.chapterId,
          selectedHighlight.startTag,
          selectedHighlight.endTag,
        );
      }
    },
    saveHighlight: (state, action: PayloadAction<Highlight>) => {
      state.highlights[action.payload.id] = action.payload;
      updateGlobalSavedHighlights(state.highlights);
    },
    deleteHighlight: (state, action: PayloadAction<Highlight>) => {
      Object.keys(state.highlights).forEach((highlightId) => {
        const highlight = state.highlights[parseInt(highlightId)];

        if (
          highlight.startTag !== action.payload.startTag ||
          highlight.endTag !== action.payload.endTag ||
          highlight.chapterId !== action.payload.chapterId
        )
          return;

        delete state.highlights[parseInt(highlightId)];
      });
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
