import React, { Ref, useEffect, useRef, useState } from 'react';
import { bioHTML } from 'utils/bionify';
import { AO3Chapter } from 'utils/types';
// import dompurify from 'dompurify';

type ChapterProps = {
  chapter: AO3Chapter;
  selected: boolean;
};

export const Chapter = ({ chapter, selected }: ChapterProps) => {
  const titleDivRef: Ref<HTMLDivElement> = useRef(null);
  const [showingChapterContent, showChapterContent] = useState(false);
  // TODO: Actually trying adding back in for safety
  // const safeChapterContent = dompurify.sanitize(chapter.textDivHTML);
  const safeChapterContent = bioHTML(chapter.textDivHTML);

  useEffect(() => {
    if (selected) {
      console.log('Scrolling into view for chapter ', chapter.meta.count);
      titleDivRef.current!.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      showChapterContent(true);
    }
  }, []);

  return (
    <>
      <div ref={titleDivRef} className="chapter_title" onClick={() => showChapterContent((curVal) => !curVal)}>
        {chapter.meta.title}
      </div>
      <div
        className="chapter_text"
        dangerouslySetInnerHTML={{ __html: showingChapterContent && safeChapterContent || '' }}
      />
    </>
  );
};
