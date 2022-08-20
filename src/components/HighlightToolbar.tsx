import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Highlight } from 'utils/types';
import { useAppStoreSelector } from './Redux-Store/hooks';
import { AiTwotoneHighlight } from 'react-icons/ai';
import { MdEditNote } from 'react-icons/md';
import { FiShare2 } from 'react-icons/fi';
import { MdContentCopy } from 'react-icons/md';

const Toolbar = () => {
  return (
    <span className="highlight-toolbar-container">
      <div className="highlight-toolbar">
        <span
          className="highlight-toolbar-icon-container"
          data-tooltip="Highlight"
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
    </span>
  );
};

export const HighlightToolbar = () => {
  const currentSelection = useAppStoreSelector(
    (state) => state.highlight.currentSelection,
  );
  const [container, setContainer] = useState(null as Element | null);

  useEffect(() => {
    const getContainer = (highlight: Highlight | null) => {
      if (!highlight){
        return null;
      }

      const firstElement = document.querySelector(`.${highlight.startTag}`);
      const lastElement = document.querySelector(`.${highlight.endTag}`);
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

    console.log('Container is ',toolbarContainer);

  }, [currentSelection]);

  return (container && ReactDOM.createPortal(<Toolbar />, container)) || null;
};
