import { PagesFlipping } from '@/components/Icons';
import { selectSavedHighlight } from '@/components/Redux-Store/HighlightSlice';
import { useAppStoreDispatch, useAppStoreSelector } from '@/components/Redux-Store/hooks';
import { jumpToChapter } from '@/components/Redux-Store/WorksSlice';
import { useRegisterActions } from 'kbar';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Highlight } from 'utils/types';

export type ImprovedHighlight = Highlight & {
  chapterCount?: number;
  selected?: boolean;
  index?:number
};

export default function useJumpToHighlight() {
  const dispatch = useAppStoreDispatch();

  const highlights = useAppStoreSelector(state => {
    //TODO: Optimize this later, this runs way too much. Should be fine for now, since these are "relatively" cheap operations

    const highlightArray: ImprovedHighlight[] = Object.keys(state.highlight.highlights).map((id) => parseInt(id))
    .map(id => {
      return {
        ...state.highlight.highlights[id],
        ...{
          chapterCount: state.work.chapterInfo[state.highlight.highlights[id].chapterId].count,
        }
      }
    });

    const currentSelectionIndex = highlightArray.findIndex(highlight => {
      return (
        highlight.chapterId === state.highlight.currentSelection?.chapterId &&
        highlight.endTag === state.highlight.currentSelection.endTag &&
        highlight.startTag === state.highlight.currentSelection.startTag
      );
    });

    highlightArray.forEach((highlight, index) => {
      if(index === currentSelectionIndex)
        highlight.selected = true;
      else
        highlight.selected = false;
      highlight.index = index;
    })

    if(!highlightArray.length)
      return null;

    const highlights = highlightArray.reduce((acc, cur) => {
      acc[cur.id] = cur;
      return acc
    }, {} as {[key: number]: ImprovedHighlight});

    const firstHighlight = highlightArray[0];
    const lastHighlight = highlightArray[highlightArray.length - 1];
    const dateSortedHighlightArray =
      highlightArray.sort((a,b) => {
        if(!a.createdAt || !b.createdAt)
          return 0;
        else return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      });
    const oldestHighlight = dateSortedHighlightArray[0];
    const newestHighlight = dateSortedHighlightArray[dateSortedHighlightArray.length-1];

    return {
      firstHighlight,
      lastHighlight,
      oldestHighlight,
      newestHighlight,
      highlights
    }
  });

  useEffect(() => {
    console.log('Highlights - ',highlights);
  })

  const chapterActions = [
      {
        id: 'jumpToHighlight',
        icon: (
          <div>
            <PagesFlipping />
          </div>
        ),
        name: 'Highlights',
        keywords: 'highlight jump next',
        section: 'Navigation',
      },
      {
        id: 'jumpToFirstHighlight',
        name: 'Jump To First Highlight',
        parent: 'jumpToHighlight',
        perform: () => {
          if(!highlights)
            return toast('No highlights yet!');
          console.log('Jumping to ',highlights.firstHighlight);
          dispatch(jumpToChapter(highlights.firstHighlight.chapterId));
          window.setTimeout(() => {
            dispatch(selectSavedHighlight(highlights.firstHighlight.id))
          }, 0);
        }
      },
      // {
      //   id: 'jumpToLastHighlight',
      //   name: 'Jump To Last Highlight',
      //   parent: 'jumpToHighlight',
      //   perform: () => {
      //     console.log('Jumping to ',highlights.lastHighlight);
      //     dispatch(jumpToChapter(highlights.lastHighlight.chapterId));
      //     dispatch(selectSavedHighlight(highlights.lastHighlight.id))
      //   }
      // },
      // {
      //   id: 'jumpToOldestHighlight',
      //   name: 'Jump To Oldest Highlight',
      //   parent: 'jumpToHighlight',
      //   perform: () => {
      //     console.log('Jumping to ',highlights.oldestHighlight);
      //     dispatch(selectSavedHighlight(highlights.oldestHighlight.id))
      //   }
      // },
      // {
      //   id: 'jumpToNewestHighlight',
      //   name: 'Jump To Newest Highlight',
      //   parent: 'jumpToHighlight',
      //   perform: () => {
      //     console.log('Jumping to ',highlights.newestHighlight);
      //     dispatch(selectSavedHighlight(highlights.newestHighlight.id))
      //   }
      // },
    ];

  useRegisterActions(chapterActions);
}
