import { debounce } from 'lodash';
import Image from 'next/image';
import React, { Ref, useEffect, useRef, useState } from 'react';
import { bioHTML } from 'utils/bionify';
import { updateChapterSavedHighlights } from 'utils/highlight';
import { AO3Chapter } from 'utils/types';
import { Meta } from './Meta';
import { highlightChanged } from './Redux-Store/HighlightSlice';
import { useAppStoreDispatch, useAppStoreSelector } from './Redux-Store/hooks';
import { setCurrentChapter } from './Redux-Store/WorksSlice';

type ChapterProps = {
  chapter: AO3Chapter;
  jumpToThisChapter: boolean;
};

const Chapter = ({ chapter, jumpToThisChapter }: ChapterProps) => {
  const dispatch = useAppStoreDispatch();

  const titleDivRef: Ref<HTMLDivElement> = useRef(null);
  const textDivRef: Ref<HTMLDivElement> = useRef(null);
  const [showingChapterContent, showChapterContent] = useState(false);
  const safeChapterContent = bioHTML(chapter.textDivHTML, {
    prefix: String(chapter.meta.count),
    startId: chapter.meta.id,
  });
  const highlights = useAppStoreSelector((state) => state.highlight.highlights);
  const speedReadingMode = useAppStoreSelector(
    (state) => state.user.displayPreferences.speedReadingMode,
  );
  const scrollWithinThisChapter = useAppStoreSelector(state => state.work.currentChapterId === chapter.meta.id ? state.work.chapterScrollPercentage : null);

  useEffect(() => {
    if (showingChapterContent) {
      window.setTimeout(() => {
        if (speedReadingMode) {
          const rests = document
            .querySelector(`.chapter-${chapter.meta.id}`)
            ?.querySelectorAll(':scope .bio-rest');
          if (rests)
            for (let i = 0; i < rests.length; i++)
              rests[i].classList.add('fast-reading-enabled');
        } else {
          const rests = document
            .querySelector(`.chapter-${chapter.meta.id}`)
            ?.querySelectorAll(':scope .bio-rest');

          if (rests)
            for (let i = 0; i < rests.length; i++)
              rests[i].classList.remove('fast-reading-enabled');
        }
      }, 0);
    }
  }, [showingChapterContent, speedReadingMode, chapter.meta.id]);

  useEffect(() => {
    if (showingChapterContent) {
      window.setTimeout(() => {
        updateChapterSavedHighlights(chapter.meta.id, highlights);
      }, 0);
    }
  }, [showingChapterContent, highlights, chapter.meta.id]);

  useEffect(() => {
    if (showingChapterContent) {
      const footNoteLinks = document
        .querySelector(`.chapter-${chapter.meta.id}`)
        ?.querySelectorAll(':scope a');

      footNoteLinks?.forEach((link) => {
        try {
          if (!link || !('href' in link)) return;
          const linkSplit = (link as any).href?.split('#');
          if (!linkSplit || !linkSplit.length) return;
          const linkId = linkSplit[linkSplit.length - 1];

          const linkElement = document.querySelector(
            `a[name=${linkId}]`,
          ) as HTMLLinkElement | null;

          const linkContent = linkElement?.parentElement?.textContent;

          ((link as HTMLLinkElement).dataset as any).tooltip = linkContent
            ? linkContent.substring(0, 500) +
              (linkContent.length > 500 ? '...' : '')
            : 'Click to go to footnote';
        } catch (err) {
          console.error('error adjusting link text - ', err);
        }
      });
    }
  }, [showingChapterContent, chapter.meta.id]);

  useEffect(() => {
    if (jumpToThisChapter) {
      let waitToScrollMs = 0;
      if (!showingChapterContent) {
        showChapterContent(true);
        waitToScrollMs = 300;
      }
      window.setTimeout(() => {
        if(scrollWithinThisChapter === null) {
          if (titleDivRef.current)
            titleDivRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
        } else {
          if(textDivRef.current) {
            const bounds = textDivRef.current.getBoundingClientRect();
            window.scroll({top: bounds.top + window.scrollY + (bounds.height * scrollWithinThisChapter)});
          }
        }

      }, waitToScrollMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpToThisChapter]);

  // TODO: Calling this android selection to note the complete lack of testing on iphone
  function handleAndroidSelection(e: any) {
    if (e.type === 'contextmenu') {
      console.log('Firing debounced selection handler...');
      handleMouseTouchEnd();
    } else if (e.type === 'touchcancel') {
      console.log('Cancelling selection handler...');
      handleMouseTouchEnd.cancel();
    }

    // handleMouseTouchEnd();
    return false;
  }

  const handleMouseTouchEnd = debounce(() => {
    const selection = window.getSelection();

    let selectedHTML = '';

    if (selection) {
      const selectionContainer = document.createElement('div');

      if (selection.rangeCount)
        for (let i = 0; i < selection.rangeCount; i++)
          selectionContainer.appendChild(
            selection.getRangeAt(i).cloneContents(),
          );

      selectedHTML = selectionContainer.innerHTML;
    }

    dispatch(
      highlightChanged({
        selectedHTML: selectedHTML,
        chapterId: chapter.meta.id,
      }),
    );
  }, 100);

  return (
    <div
      className={`chapter_container chapter_container_${chapter.meta.count}`}
      onMouseUp={handleMouseTouchEnd}
      onContextMenu={handleAndroidSelection}
      onTouchCancel={handleAndroidSelection}
    >
      <div
        ref={titleDivRef}
        className="chapter_title"
        onClick={() => {
          dispatch(setCurrentChapter(chapter.meta.id));
          showChapterContent((curVal) => !curVal);
        }}
      >
        {chapter.meta.title}
      </div>
      {showingChapterContent && (
        <div className="chapter_meta_data">
          <Meta contentHTML={chapter.summaryDivHTML} title="Summary" />
          <Meta contentHTML={chapter.startNotesDivHTML} title="Notes" />
        </div>
      )}
      <div
        className={`chapter_text chapter-${chapter.meta.id}`}
        ref={textDivRef}
        dangerouslySetInnerHTML={{
          __html: (showingChapterContent && safeChapterContent) || '',
        }}
      />
      {showingChapterContent && (
        <div className="chapter_meta_data">
          <Meta contentHTML={chapter.endNotesDivHTML} title="EndNotes" />
        </div>
      )}
      {(showingChapterContent && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '30px 0',
          }}
        >
          <Image
            src="/curlydivider.svg"
            alt="Divider"
            width="500"
            height="100"
            style={{
              maxHeight: '50px',
              margin: 'auto 0',
            }}
          />
        </div>
      )) ||
        null}
    </div>
  );
};

export const MemoizedChapter = React.memo(Chapter);
