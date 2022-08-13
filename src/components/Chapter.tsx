import React, { Ref, useEffect, useRef, useState } from 'react';
import { bioHTML } from 'utils/bionify';
import { AO3Chapter } from 'utils/types';
// import dompurify from 'dompurify';

type ChapterProps = {
  chapter: AO3Chapter;
  activeChapterNumber: number | null;
};

export const Chapter = ({ chapter, activeChapterNumber }: ChapterProps) => {
  const titleDivRef: Ref<HTMLDivElement> = useRef(null);
  const [showingChapterContent, showChapterContent] = useState(false);
  // TODO: Actually trying adding back in for safety
  // const safeChapterContent = dompurify.sanitize(chapter.textDivHTML);
  const safeChapterContent = bioHTML(chapter.textDivHTML);

  useEffect(() => {
    if (activeChapterNumber === chapter.meta.id) {
      showChapterContent(true);
      window.setTimeout(() => {
        if (titleDivRef.current)
          titleDivRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 150);
    }
  }, [activeChapterNumber, titleDivRef, chapter.meta.id]);

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
        className={`chapter_title chapter_${chapter.meta.count}`}
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
