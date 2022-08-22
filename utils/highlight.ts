import { selectSavedHighlight } from '@/components/Redux-Store/HighlightSlice';
import { appStore } from '@/components/Redux-Store/ReduxStore';
import { debounce } from 'lodash';
import { Highlight, SavedHighlights, ToolbarPosition } from './types';

export function makeDocumentSelection(chapterId: number, startTagId: number, endTagId: number) {
  console.log('Making doc selection... for chapter ',chapterId);
  const context = document.querySelector(`.chapter-${chapterId}`);

  if(!context)
    return;

  console.log('Finding tags ',{startTagId, endTagId});

  const startTag = context.querySelector(`:scope .tp-${startTagId}`);
  const endTag = context.querySelector(`:scope .tp-${endTagId}`);

  if(!startTag || !endTag)
    return;

  window.getSelection()?.removeAllRanges();

  const newRange = document.createRange();
  newRange.setStart(startTag as Node, 0);
  newRange.setEnd(endTag as Node, 0);
  window.getSelection()?.addRange(newRange);
}

export function clarifyAndGetSelection(
  highlightedHTML: string,
  chapterId: number,
  highlightId: number,
): Highlight | null {
  const tagsMatched = highlightedHTML.match(/tp-[\d]+[\d]+/g);
  const tags = (tagsMatched && (tagsMatched as string[])) || [];

  let tag1 = '',
    tag2 = '';

  const context = document.querySelector(`.chapter-${chapterId}`);
  let chapterElements: Element[] = [];
  const chapterTags: string[] = tags.filter((tag) => {
    const elements = context?.querySelectorAll(`:scope .${tag}`);
    const elemArray = elements && Array.from(elements);
    if (elemArray) {
      const nonEmptyElements = elemArray.filter(
        (elem) => elem.innerHTML !== '' && elem.innerHTML.search(/\S/g) !== -1,
      );

      if (nonEmptyElements.length) {
        if (tag1 === '') tag1 = nonEmptyElements[0].className;
        tag2 = nonEmptyElements[nonEmptyElements.length - 1].className;
      }

      chapterElements = chapterElements.concat(elemArray);
    }
    if (!elemArray || !elemArray.length) return false;
    else return true;
  });

  document
    .querySelectorAll('.text-selected')
    ?.forEach((elem) => elem.classList.remove('text-selected'));

  // TODO: Possibly move this to a separate function
  // to make reasoning about side-effects easier
  if (chapterElements.length) {
    chapterElements.forEach((element) =>
      element.classList.add('text-selected'),
    );
  }

  window.getSelection()?.removeAllRanges();

  if (tag1 && tag2) {
    const tagNumber1 = getTagNumberFromClasses(tag1);
    const tagNumber2 = getTagNumberFromClasses(tag2);

    if (tagNumber1 && tagNumber2) {
      makeDocumentSelection(chapterId, tagNumber1, tagNumber2);

      return {
        chapterId,
        startTag: Math.min(tagNumber1, tagNumber2),
        endTag: Math.max(tagNumber1, tagNumber2),
        id: highlightId,
        note: ''
      };
    }
  }

  return null;
}

function getTagNumberFromClasses(classes: string) {
  const tagMatch = classes.match(/tp-([\d]+)/);
  if (tagMatch && tagMatch.length >= 2 && !isNaN(parseInt(tagMatch[1])))
    return parseInt(tagMatch[1]);
  return null;
}

export function updateChapterSavedHighlights(
  chapterId: number,
  highlights: SavedHighlights,
) {
  function tagInHighlight(tag: number, highlight: Highlight) {
    if (tag <= highlight.endTag && tag >= highlight.startTag) return true;
    return false;
  }

  const highlightArray = Object.keys(highlights).map(highlightId => highlights[parseInt(highlightId)]);

  const chapterContext = document.querySelector(`.chapter-${chapterId}`);
  if (!chapterContext) return;

  const chapterHighlights = highlightArray.filter(
    (highlight) => highlight.chapterId === chapterId,
  );

  const chapterTags = Array.from(
    chapterContext.querySelectorAll(':scope .bio-tag') || [],
  )
    .map((element) => ({
      element,
      tagNumber: getTagNumberFromClasses(element.className) || null,
    }))
    .filter((tag) => tag.tagNumber !== null) as {
    element: Element;
    tagNumber: number;
  }[];

  chapterContext.querySelectorAll(':scope .bio-tag').forEach(c => c.removeEventListener('mouseenter', highlightMouseEnter));

  chapterTags.forEach(tag => {
    // tag.element.removeEventListener('mouseenter', highlightMouseEnter);
    // tag.element.removeEventListener('mouseleave', highlightMouseLeave);
    tag.element.classList.remove('text-highlighted');
    tag.element.classList.remove('has-note');
    tag.element.classList.remove('text-highlighted-hovered');
    const highlightTagMatch = tag.element.className.match(/highlight-[\d]+/);
    if(highlightTagMatch && highlightTagMatch.length)
      tag.element.classList.remove(highlightTagMatch[1]);
  });

  chapterHighlights.forEach((highlight) => {
    const highlightedTags = chapterTags.filter((tag) => {
      return tagInHighlight(tag.tagNumber, highlight);
    });

    if(highlightedTags.length && highlight.note.length)
      highlightedTags[0].element.classList.add('has-note');

    highlightedTags.forEach((tag) => {
      tag.element.classList.add('text-highlighted');
      tag.element.classList.add(`highlight-${highlight.id}`);
      // tag.element.addEventListener('mouseenter', highlightMouseEnter);
      // tag.element.addEventListener('mouseleave', highlightMouseLeave);
      tag.element.addEventListener('click', highlightClick);
    });
  });
}

function highlightClick(event: any) {
  if(event && event.srcElement && event.srcElement.className) {
    const highlightMatch = event.srcElement.className.toString().match(/highlight-([\d])+/);
    if(highlightMatch && highlightMatch.length >= 2 && !isNaN(parseInt(highlightMatch[1]))) {
      const highlightId = parseInt(highlightMatch[1]);
      console.log('Showing toolbar for ',highlightId);
      appStore.dispatch(selectSavedHighlight(highlightId))
    }
  };
}

function highlightMouseEnter(event: any) {
  highlightMouseLeave.cancel();
  if(event && event.toElement && event.toElement.className && event.toElement.classList.contains('text-highlighted')) {
    const highlightTagMatch = event.toElement.className.toString().match(/highlight-[\d]+/);
    if(highlightTagMatch && highlightTagMatch.length) {
      console.log('highlighting ',highlightTagMatch[0])
      document.querySelectorAll(`.${highlightTagMatch[0]}`).forEach(elem => elem.classList.add('text-highlighted-hovered'));
    }
  }
}

const highlightMouseLeave = debounce((event: any) => {
  if(event && event.fromElement && event.fromElement.className) {
    const highlightTagMatch = event.fromElement.className.toString().match(/highlight-[\d]+/);
    if(highlightTagMatch && highlightTagMatch.length) {
      console.log('highlighting ',highlightTagMatch[0])
      document.querySelectorAll(`.${highlightTagMatch[0]}`).forEach(elem => elem.classList.remove('text-highlighted-hovered'));
    }
  }
}, 100);

export function updateGlobalSavedHighlights(highlights: SavedHighlights) {
  Array.from(
    new Set(Object.keys(highlights).map((highlightId) => highlights[parseInt(highlightId)].chapterId)),
  ).forEach((chapterId) => updateChapterSavedHighlights(chapterId, highlights));
}

const getSelectionRect = (selection: Selection) => {
  try {
    const firstRange = selection.getRangeAt(0);

    return getEndLineRect(firstRange, isSelectionForward(selection));
  } catch (err) {
    console.error('Error getting selection rect - ', err);
    return null;
  }
};

export const getToolbarPosition = (
  selection: Selection,
  window: Window,
  document: Document,
): ToolbarPosition | null => {
  const toolbarConfig: ToolbarPosition = {};

  const selectionRect = getSelectionRect(selection);
  const offsetScroll = getOffsetScroll(window);

  if (!selectionRect) return null;

  if (isSelectionForward(selection)) {
    toolbarConfig.right = `${
      document.documentElement.clientWidth -
      selectionRect.right +
      offsetScroll.left
    }px`;
  } else {
    toolbarConfig.left = `${selectionRect.left - offsetScroll.left}px`;
  }
  toolbarConfig.width = `${selectionRect.right - selectionRect.left}px`;
  toolbarConfig.height = `${selectionRect.bottom - selectionRect.top}px`;
  toolbarConfig.top = `${selectionRect.top - offsetScroll.top}px`;

  return toolbarConfig;
};

export function getOffsetScroll(window: Window) {
  const body = window.document.body;
  const scrollReference =
    window.getComputedStyle(body).position === 'static'
      ? body.parentNode
      : body;
  return (scrollReference as any).getBoundingClientRect() || null;
}

function getEndLineRect(range: Range, isForward: boolean) {
  let endLineRects;
  const rangeRects = range.getClientRects();
  const sliceRects = [].slice.bind(rangeRects) as (
    start?: number | undefined,
    end?: number | undefined,
  ) => DOMRect[];

  if (isForward) {
    let lastLeft = Infinity;
    let i = rangeRects.length;
    while (i--) {
      const rect = rangeRects[i];
      if (rect.left > lastLeft) break;
      lastLeft = rect.left;
    }
    endLineRects = sliceRects(i + 1);
  } else {
    let lastRight = -Infinity;
    let i = 0;
    for (; i < rangeRects.length; i++) {
      const rect = rangeRects[i];
      if (rect.right < lastRight) break;
      lastRight = rect.right;
    }
    endLineRects = sliceRects(0, i);
  }

  return {
    top: Math.min(...endLineRects.map((rect) => rect.top)),
    bottom: Math.max(...endLineRects.map((rect) => rect.bottom)),
    left: endLineRects[0].left,
    right: endLineRects[endLineRects.length - 1].right,
  };
}

function isSelectionForward(selection: Selection) {
  if (selection.isCollapsed) return true;

  if (selection.focusNode && selection.anchorNode) {
    const comparedPositions = selection.anchorNode.compareDocumentPosition(
      selection.focusNode,
    );
    if (!comparedPositions) {
      // It's the same node
      return selection.anchorOffset < selection.focusOffset;
    }

    // eslint-disable-next-line no-bitwise
    return (
      (comparedPositions & 4) /* === Node.DOCUMENT_POSITION_FOLLOWING */ > 0
    );
  }

  return true;
}
