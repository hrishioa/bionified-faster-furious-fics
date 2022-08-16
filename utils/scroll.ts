import { ChapterMeta } from './types';

export const getScrollPosition = (element: Element) => {
  if (element.getBoundingClientRect().height <= 0) return null;
  return (
    1 -
    Math.max(
      0,
      (element.getBoundingClientRect().height +
        Math.min(0, element.getBoundingClientRect().y)) /
        element.getBoundingClientRect().height,
    )
  );
};

export const getChapterScrollPosition = (
  document: Document,
  chapterInfo: ChapterMeta[],
): {
  chapterId: number;
  scrollPosition: number;
} => {
  let chapterId: number | null = null;
  let scrollPosition = 0;

  const chapterDivs = document.querySelectorAll('.chapter_text');

  for (let i = 0; i < chapterDivs.length; i++) {
    const chapter = chapterDivs[i];

    const chapterScrollPosition = getScrollPosition(chapter);

    const chapterIdMatch = chapter.className.match(/chapter-([\d]+)/);
    if (!chapterIdMatch || chapterIdMatch.length < 2) continue;

    if (!isNaN(parseInt(chapterIdMatch[1])) && chapterScrollPosition !== null) {
      const chapterMeta = chapterInfo.find(
        (infoChapter) => infoChapter.id === parseInt(chapterIdMatch[1]),
      );

      if (chapterMeta) {
        if (chapterScrollPosition >= 1 && (!chapterId || scrollPosition >= 1)) {
          chapterId = chapterMeta.id;
          scrollPosition = chapterScrollPosition;
        } else {
          chapterId = chapterMeta.id;
          scrollPosition = chapterScrollPosition;
          break;
        }
      }

      if (chapterMeta && scrollPosition < 1) {
        chapterId = chapterMeta.id;
        scrollPosition = chapterScrollPosition;
        break;
      }
    }
  }

  if(!chapterId) {
    chapterId = chapterInfo[0].id;
    scrollPosition = 0;
  }

  return {
    chapterId,
    scrollPosition,
  };
};
