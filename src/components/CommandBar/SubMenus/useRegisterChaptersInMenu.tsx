import {
  jumpToChapter,
} from '@/components/Redux-Store/WorksSlice';
import { ActionImpl, useRegisterActions } from 'kbar';
import { useDispatch } from 'react-redux';

type MenuChapter = {
  name: string;
  count: number;
  id: number;
};

export default function useRegisterChaptersInMenu(
  chapters: MenuChapter[],
  chapterCount: number,
) {
  const dispatch = useDispatch();

  const chapterActions = [
    ...[
      {
        id: 'jumpToChapter',
        name: 'Jump To Chapter',
        keywords: 'chapter jump find',
        section: 'Navigation',
      },
    ],
    ...chapters.map((chapter) => ({
      id: String(chapter.id),
      name: chapter.name,
      priority: chapterCount - chapter.count,
      keywords: 'chapter jump',
      parent: 'jumpToChapter',
      perform: (action: ActionImpl) => {
        dispatch(jumpToChapter(parseInt(action.id)));
      },
    })),
  ];

  useRegisterActions(chapterActions);
}
