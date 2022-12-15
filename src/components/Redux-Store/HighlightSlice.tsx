import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clarifyAndGetSelection,
  makeDocumentSelection,
  updateGlobalSavedHighlights,
} from 'utils/highlight';
import { serverGetHighlights } from 'utils/server';
import { Highlight, SavedHighlights } from 'utils/types';
import toast from 'react-hot-toast';

export type HighlightState = {
  currentSelection: Highlight | null;
  highlights: SavedHighlights;
  jumpToHighlight: {
    requested: number | null;
    availableHighlight: Highlight | null;
  } | null;
};

const initialHighlightState: HighlightState = {
  currentSelection: null,
  highlights: {},
  jumpToHighlight: null,
};

const HIGHLIGHT_HASH_MAX = 100000000;

const highlightSlice = createSlice({
  name: 'highlight',
  initialState: initialHighlightState,
  reducers: {
    requestJumpToHighlight: (state, action: PayloadAction<number>) => {
      state.jumpToHighlight = {
        requested: action.payload,
        availableHighlight: state.highlights[action.payload] || null,
      };
    },
    highlightJumpFinished: (state) => {
      state.jumpToHighlight = null;
    },
    highlightChanged: (
      state,
      action: PayloadAction<{ selectedHTML: string; chapterId: number }>,
    ) => {
      const highlight = clarifyAndGetSelection(
        action.payload.selectedHTML,
        action.payload.chapterId,
        Math.floor(Math.random() * HIGHLIGHT_HASH_MAX),
      );

      const existingHighlightId = Object.keys(state.highlights).find(
        (highlightId) => {
          const existingHighlight = state.highlights[parseInt(highlightId)];
          return (
            existingHighlight.chapterId === highlight?.chapterId &&
            existingHighlight.startTag === highlight?.startTag &&
            existingHighlight.endTag === highlight?.endTag
          );
        },
      );

      if (existingHighlightId)
        state.currentSelection =
          state.highlights[parseInt(existingHighlightId)];
      else state.currentSelection = highlight;
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
      state.highlights[action.payload.id] = {
        ...action.payload,
        ...{
          createdAt: new Date().toISOString()
        }
      };
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
  extraReducers: (builder) => {
    builder.addCase(fetchServerHighlights.fulfilled, (state, action) => {
      let addedHighlights = 0;

      if (action.payload.length) {
        action.payload.forEach((highlight) => {
          if (!state.highlights[highlight.id]) addedHighlights++;
          state.highlights[highlight.id] = highlight;
        });
      }

      if (addedHighlights)
        toast(
          `Loaded ${addedHighlights} new highlight${
            addedHighlights > 1 ? 's' : ''
          }!`,
        );

      if (
        state.jumpToHighlight?.requested &&
        state.highlights[state.jumpToHighlight.requested]
      ) {
        console.log('Highlight requested is now available...');
        state.jumpToHighlight = {
          requested: state.jumpToHighlight.requested,
          availableHighlight: state.highlights[state.jumpToHighlight.requested],
        };
      }
    });
  },
});

export const fetchServerHighlights = createAsyncThunk<
  Highlight[],
  { workId: number }
>('highlight/fetchServerHighlights', async (argument: { workId: number }) => {
  const highlights = await serverGetHighlights(argument.workId);
  return highlights;
});

export const {
  highlightChanged,
  saveHighlight,
  deleteHighlight,
  selectSavedHighlight,
  requestJumpToHighlight,
  highlightJumpFinished,
} = highlightSlice.actions;
export default highlightSlice.reducer;
