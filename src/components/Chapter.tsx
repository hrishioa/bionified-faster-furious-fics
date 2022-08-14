import React, { CSSProperties, Ref, useEffect, useRef, useState } from 'react';
import { bioHTML } from 'utils/bionify';
import { getToolbarPosition } from 'utils/selection';
import { AO3Chapter, ToolbarPosition } from 'utils/types';

type SelectionToolbarProps = {
  positionStyle: ToolbarPosition;
};

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  positionStyle,
}) => {
  return <div className="selection-container" style={positionStyle}></div>;
};

type ChapterProps = {
  chapter: AO3Chapter;
  selected: boolean;
};

const Chapter = ({ chapter, selected }: ChapterProps) => {
  const titleDivRef: Ref<HTMLDivElement> = useRef(null);
  const [showingChapterContent, showChapterContent] = useState(false);
  const safeChapterContent = bioHTML(chapter.textDivHTML, {
    prefix: String(chapter.meta.count),
    startId: chapter.meta.id,
  });
  const [selectionToolbarConfig, setSelectionToolbarConfig] = useState({
    positionStyle: { display: 'none' },
  } as SelectionToolbarProps);
  const [selectedTags, setSelectedTags] = useState([] as string[]);

  useEffect(() => {
    if (selected) {
      let waitToScrollMs = 0;
      if (!showingChapterContent) {
        showChapterContent(true);
        waitToScrollMs = 150;
      }
      window.setTimeout(() => {
        if (titleDivRef.current)
          titleDivRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, waitToScrollMs);
    }
  }, [selected]);

  useEffect(() => {
    highlightSelectedTags(selectedTags);
  }, [selectedTags]);

  function getSelectedTags(selectionHTML: string) {
    return selectionHTML.match(/tp-[\d]+-[\d]+/g);
  }

  function highlightSelectedTags(tags: string[]) {
    document
      .querySelectorAll('.text-selected')
      ?.forEach((elem) => elem.classList.remove('text-selected'));

    tags.forEach((tag) => {
      document
        .querySelector(`.chapter-${chapter.meta.id}`)
        ?.querySelectorAll(`.${tag}`)
        ?.forEach((elem) => elem.classList.add('text-selected'));
    });
  }

  function highlightSelection(selectionHTML: string) {
    setSelectedTags(getSelectedTags(selectionHTML) || []);
    if (!selectionHTML.length)
      setSelectionToolbarConfig({ positionStyle: { display: 'none' } });
  }

  function handleMouseTouchEnd() {
    const selection = window.getSelection();

    if (!selection) {
      setSelectionToolbarConfig({ positionStyle: { display: 'none' } });
      return highlightSelection('');
    }

    const selectionContainer = document.createElement('div');

    if (selection.rangeCount)
      for (let i = 0; i < selection.rangeCount; i++)
        selectionContainer.appendChild(selection.getRangeAt(i).cloneContents());

    highlightSelection(selectionContainer.innerHTML);

    const toolbarConfig = getToolbarPosition(selection, window, document);

    if (!toolbarConfig) {
      setSelectionToolbarConfig({ positionStyle: { display: 'none' } });
    } else {
      console.log('Showing toolbar');
      setSelectionToolbarConfig({
        positionStyle: toolbarConfig,
      });
    }

    window.getSelection()?.removeAllRanges();
  }

  return (
    <>
      <div
        ref={titleDivRef}
        className="chapter_title"
        onClick={() => showChapterContent((curVal) => !curVal)}
      >
        {chapter.meta.title}
      </div>
      <div
        className={`chapter_text chapter-${chapter.meta.id}`}
        onMouseUp={handleMouseTouchEnd}
        onTouchEnd={handleMouseTouchEnd}
        dangerouslySetInnerHTML={{
          __html: (showingChapterContent && safeChapterContent) || '',
        }}
      />
      {selectionToolbarConfig ? (
        <SelectionToolbar {...selectionToolbarConfig} />
      ) : null}
    </>
  );
};

export const MemoizedChapter = React.memo(Chapter);
