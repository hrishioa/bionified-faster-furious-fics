import { Highlight, ToolbarPosition } from './types';

export function clarifyAndGetSelection(
  highlightedHTML: string,
  chapterId: number,
): Highlight | null {
  const tagsMatched = highlightedHTML.match(/tp-[\d]+-[\d]+/g);
  const tags = (tagsMatched && (tagsMatched as string[])) || [];

  const context = document.querySelector(`.chapter-${chapterId}`);
  let nodeElements: Element[] = [];
  const chapterTags: string[] = tags.filter((tag) => {
    const elements = context?.querySelectorAll(`:scope .${tag}`);
    const elemArray = elements && Array.from(elements);
    if (elemArray) nodeElements = nodeElements.concat(elemArray);
    if (!elemArray || !elemArray.length) return false;
    else return true;
  });

  document
  .querySelectorAll('.text-selected')
  ?.forEach((elem) => elem.classList.remove('text-selected'));

  window.getSelection()?.removeAllRanges();

  // TODO: Possibly move this to a separate function
  // to make reasoning about side-effects easier
  if (nodeElements.length) {
    const newRange = document.createRange();
    newRange.setStart(nodeElements[0] as Node, 0);
    newRange.setEnd(nodeElements[nodeElements.length - 1] as Node, 0);
    window.getSelection()?.addRange(newRange);

    nodeElements.forEach(element => element.classList.add('text-selected'));
  }

  return chapterTags.length
    ? {
        chapterId,
        startTag: chapterTags[0],
        endTag: chapterTags[chapterTags.length - 1],
      }
    : null;
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
