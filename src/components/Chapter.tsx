import React, { Ref, useEffect, useRef, useState } from 'react';
import { bioHTML } from 'utils/bionify';
import { AO3Chapter } from 'utils/types';

type ChapterProps = {
  chapter: AO3Chapter;
  selected: boolean;
};

const Chapter = ({ chapter, selected }: ChapterProps) => {
  const titleDivRef: Ref<HTMLDivElement> = useRef(null);
  const [showingChapterContent, showChapterContent] = useState(false);
  const safeChapterContent = bioHTML(chapter.textDivHTML);

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
  }, [selected, showingChapterContent]);

  function getSelectedTags(selectionHTML: string) {
    return selectionHTML.match(/tp-[\d]+/g);
  }

  function highlightSelectedTags(tags: string[]) {
    document
      .querySelectorAll('.text-selected')
      ?.forEach((elem) => elem.classList.remove('text-selected'));

    tags.forEach((tag) => {
      document
        .querySelectorAll(`.${tag}`)
        ?.forEach((elem) => elem.classList.add('text-selected'));
    });
  }

  function highlightSelection(selectionHTML: string) {
    highlightSelectedTags(getSelectedTags(selectionHTML) || []);
  }

  function handleMouseTouchEnd() {
    const selection = window.getSelection();

    if (!selection) return highlightSelection('');

    const selectionContainer = document.createElement('div');

    if (selection.rangeCount)
      for (let i = 0; i < selection.rangeCount; i++)
        selectionContainer.appendChild(selection.getRangeAt(i).cloneContents());

    highlightSelection(selectionContainer.innerHTML);
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
        className="chapter_text"
        onMouseUp={handleMouseTouchEnd}
        onTouchEnd={handleMouseTouchEnd}
        dangerouslySetInnerHTML={{
          __html: (showingChapterContent && safeChapterContent) || '',
        }}
      />
    </>
  );
};

export const MemoizedChapter = React.memo(Chapter);
