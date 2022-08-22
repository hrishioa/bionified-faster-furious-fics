import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Highlight } from 'utils/types';
import { useAppStoreDispatch, useAppStoreSelector } from './Redux-Store/hooks';
import { AiTwotoneHighlight } from 'react-icons/ai';
import { MdEditNote } from 'react-icons/md';
import { FiShare2 } from 'react-icons/fi';
import { MdContentCopy } from 'react-icons/md';
import { TiTickOutline } from 'react-icons/ti';
import {
  deleteHighlight,
  saveHighlight,
  selectSavedHighlight,
} from './Redux-Store/HighlightSlice';
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai';
import { serverDeleteHighlight, serverSaveHighlight } from 'utils/server';

const Toolbar = () => {
  const dispatch = useAppStoreDispatch();
  const currentSelection = useAppStoreSelector(
    (state) => state.highlight.currentSelection,
  );
  const [note, setNote] = useState(currentSelection?.note || '');
  const [editNoteActive, setEditNoteActive] = useState(false);
  const toolbarContainerRef = useRef(null as null | HTMLSpanElement);
  const username = useAppStoreSelector(state => state.work.workInfo?.username);
  const workId = useAppStoreSelector(state => state.work.workInfo?.id);

  useEffect(() => {
    if (toolbarContainerRef.current) {
      const rect = toolbarContainerRef.current.getBoundingClientRect();
      // if(rect.bottom > window.innerHeight || rect.bottom < 0) {
      // toolbarContainerRef.current.scrollIntoView({behavior: 'smooth'});
      window.scrollTo({
        top: rect.top + window.scrollY - window.innerHeight * 0.5,
        behavior: 'smooth',
      });
      // }
    }
  }, [currentSelection]);

  const highlightInfo: {
    highlightId: number | null;
    nextId?: number; // I give up, type-system. You win.
    previousId?: number;
  } = useAppStoreSelector((state) => {
    const highlightIds = Object.keys(state.highlight.highlights)
      .map((id) => parseInt(id))
      .sort((a, b) => {
        const highlightA: Highlight = state.highlight.highlights[a];
        const highlightB: Highlight = state.highlight.highlights[b];

        const chapterCountA =
          state.work.chapterInfo[highlightA.chapterId].count;
        const chapterCountB =
          state.work.chapterInfo[highlightB.chapterId].count;

        if (chapterCountA - chapterCountB !== 0)
          return chapterCountA - chapterCountB;

        return highlightA.startTag - highlightB.startTag;
      });

    const highlightIdIndex =
      state.highlight.currentSelection &&
      highlightIds.findIndex((highlightId) => {
        const highlight = state.highlight.highlights[highlightId];
        return (
          highlight.chapterId === state.highlight.currentSelection?.chapterId &&
          highlight.endTag === state.highlight.currentSelection.endTag &&
          highlight.startTag === state.highlight.currentSelection.startTag
        );
      });

    if (
      highlightIdIndex === -1 ||
      highlightIdIndex === null ||
      highlightIdIndex === undefined
    )
      return {
        highlightId: null,
      };

    return {
      highlightId: highlightIds[highlightIdIndex],
      nextId:
        highlightIdIndex < highlightIds.length
          ? highlightIds[highlightIdIndex + 1]
          : undefined,
      previousId:
        highlightIdIndex > 0 ? highlightIds[highlightIdIndex - 1] : undefined,
    };
  });

  function updateNote() {
    if (currentSelection) {
      if(username && workId)
        serverSaveHighlight({
          ...currentSelection,
          ...{
            note,
          },
        }, username, workId);

      dispatch(
        saveHighlight({
          ...currentSelection,
          ...{
            note,
          },
        }),
      );
    }
    setEditNoteActive(false);
  }

  function highlight() {
    if (currentSelection) {
      if (highlightInfo.highlightId === null) {
        if(username && workId)
          serverSaveHighlight(currentSelection, username, workId);
        dispatch(saveHighlight(currentSelection));
      } else {
        if(username && workId)
          serverDeleteHighlight(currentSelection, username, workId);
        dispatch(deleteHighlight(currentSelection));
      }
    }
  }

  return currentSelection ? (
    <span ref={toolbarContainerRef} className="highlight-toolbar-container">
      <div className="highlight-toolbar-window highlight-buttons-window">
        <span
          className={`highlight-toolbar-icon-container ${
            highlightInfo.highlightId !== null
              ? 'highlight-toolbar-icon-used'
              : ''
          }`}
          data-tooltip="Highlight"
          onClick={highlight}
        >
          <AiTwotoneHighlight className="highlight-toolbar-icon" />
        </span>
        <span
          className="highlight-toolbar-icon-container"
          data-tooltip="Add Note"
          onClick={() => setEditNoteActive((val) => !val)}
        >
          <MdEditNote className="highlight-toolbar-icon" />
        </span>
        <span className="highlight-toolbar-icon-container" data-tooltip="Share">
          <FiShare2 className="highlight-toolbar-icon" />
        </span>
        <span
          className="highlight-toolbar-icon-container"
          data-tooltip="Copy Text"
        >
          <MdContentCopy className="highlight-toolbar-icon" />
        </span>
        {(highlightInfo.previousId !== undefined && (
          <span
            className="highlight-toolbar-icon-container"
            data-tooltip="Previous"
            onClick={() =>
              highlightInfo.previousId !== undefined &&
              dispatch(selectSavedHighlight(highlightInfo.previousId))
            }
          >
            <AiOutlineArrowUp className="highlight-toolbar-icon" />
          </span>
        )) ||
          null}
        {(highlightInfo.nextId !== undefined && (
          <span
            className="highlight-toolbar-icon-container"
            data-tooltip="Next"
            onClick={() =>
              highlightInfo.nextId !== undefined &&
              dispatch(selectSavedHighlight(highlightInfo.nextId))
            }
          >
            <AiOutlineArrowDown className="highlight-toolbar-icon" />
          </span>
        )) ||
          null}

        {/* <span className="highlight-icon-double-container">
          <span
            className="highlight-toolbar-icon-container double-icon"
            data-tooltip="Copy Text"
          >
            <MdContentCopy className="highlight-toolbar-icon" />
          </span>
          <span
            className="highlight-toolbar-icon-container double-icon"
            data-tooltip="Copy Text"
          >
            <MdContentCopy className="highlight-toolbar-icon" />
          </span>
        </span> */}
      </div>
      {((editNoteActive || note.length) && (
        <div className="highlight-toolbar-window highlight-notes-window">
          {(editNoteActive && (
            <textarea
              rows={5}
              placeholder={'Add a note!'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          )) ||
            null}
          {(editNoteActive && (
            <div className="submit-button" onClick={updateNote}>
              <TiTickOutline className="highlight-toolbar-icon" />
            </div>
          )) ||
            null}
          {(!editNoteActive && (
            <div
              className="highlight-notes-content"
              onClick={() => setEditNoteActive(true)}
            >
              {`${currentSelection.creator ? `${currentSelection.creator}: ` : ''}${note}`}
            </div>
          )) ||
            null}
        </div>
      )) ||
        null}
    </span>
  ) : (
    <></>
  );
};

export const HighlightToolbar = () => {
  const currentSelection = useAppStoreSelector(
    (state) => state.highlight.currentSelection,
  );
  const [container, setContainer] = useState(null as Element | null);

  useEffect(() => {
    const getContainer = (highlight: Highlight | null) => {
      if (!highlight) {
        return null;
      }

      const firstElement = document.querySelector(`.tp-${highlight.startTag}`);
      const lastElement = document.querySelector(`.tp-${highlight.endTag}`);
      (window as any).sel = { firstElement, lastElement };

      if (!firstElement || !lastElement) {
        console.log('Either element missing in ', {
          firstElement,
          lastElement,
        });
        return null;
      }

      // const topSpace = firstElement.getBoundingClientRect().y;
      // const bottomSpace =
      //   window.innerHeight - lastElement.getBoundingClientRect().bottom;

      // const bestToolbarContainer =
      //   topSpace > bottomSpace ? firstElement : lastElement;

      const bestToolbarContainer = lastElement;

      return bestToolbarContainer;
    };

    const toolbarContainer = getContainer(currentSelection);

    setContainer(toolbarContainer);
  }, [currentSelection]);

  return (container && ReactDOM.createPortal(<Toolbar />, container)) || null;
};
