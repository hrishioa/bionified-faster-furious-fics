import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Highlight } from 'utils/types';
import { useAppStoreDispatch, useAppStoreSelector } from './Redux-Store/hooks';
import { AiTwotoneHighlight } from 'react-icons/ai';
import { MdEditNote } from 'react-icons/md';
import { FiShare2 } from 'react-icons/fi';
import { MdContentCopy } from 'react-icons/md';
import { deleteHighlight, saveHighlight } from './Redux-Store/HighlightSlice';

const Toolbar = () => {
  const dispatch = useAppStoreDispatch();
  const currentSelection = useAppStoreSelector(
    (state) => state.highlight.currentSelection,
  );
  const highlighted = useAppStoreSelector((state) =>
    state.highlight.currentSelection &&
    !!state.highlight.highlights.find(highlight => highlight.chapterId === state.highlight.currentSelection?.chapterId && highlight.endTag === state.highlight.currentSelection.endTag && highlight.startTag === state.highlight.currentSelection.startTag) || false
  );
  // const [highlighted, setHighlighted] = useState(false);


  function highlight() {
    if(currentSelection) {
      if(!highlighted) {
        // setHighlighted(true);
        dispatch(saveHighlight(currentSelection));
        console.log('Highlighted');
      } else {
        // setHighlighted(false);
        dispatch(deleteHighlight(currentSelection));
      }
    }
  }

  return currentSelection ?
      (<span className="highlight-toolbar-container">
        <div className="highlight-toolbar">
          <span
            className={`highlight-toolbar-icon-container ${highlighted ? 'highlight-toolbar-icon-used' : ''}`}
            data-tooltip="Highlight"
            onClick={highlight}
          >
            <AiTwotoneHighlight className="highlight-toolbar-icon" />
          </span>
          <span
            className="highlight-toolbar-icon-container"
            data-tooltip="Add Note"
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
        </div>
      </span>)
     : (<></>);
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

      const topSpace = firstElement.getBoundingClientRect().y;
      const bottomSpace =
        window.innerHeight - lastElement.getBoundingClientRect().bottom;

      const bestToolbarContainer =
        topSpace > bottomSpace ? firstElement : lastElement;

      return bestToolbarContainer;
    };

    const toolbarContainer = getContainer(currentSelection);

    setContainer(toolbarContainer);
  }, [currentSelection]);

  return (container && ReactDOM.createPortal(<Toolbar />, container)) || null;
};
