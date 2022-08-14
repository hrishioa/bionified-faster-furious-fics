import { ToolbarPosition } from './types';

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
