import { ActionImpl, useRegisterActions } from 'kbar';
import React from 'react';

type MenuChapter = {
  name: string;
  count: number;
  id: number;
};

export default function useRegisterChaptersInMenu(
  chapters: MenuChapter[],
  chapterCount: number,
  setActiveChapter: React.Dispatch<React.SetStateAction<number | null>>,
) {
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
        console.log('Setting active chapter to ', action.id);
        setActiveChapter(parseInt(action.id));
      },
    })),
  ];

  useRegisterActions(chapterActions);
}
