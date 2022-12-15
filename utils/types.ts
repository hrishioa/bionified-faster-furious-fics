import { CSSProperties } from 'react';

export type WorkInfo = {
  id: number;
  title: string;
  kudos: number;
  username: string | null;
  authenticityToken: string;
  subscribeId: number | null;
  workMeta: WorkMeta;
  workStats: WorkStats;
  summaryHTML: string;
  startNotesHTML: string;
  endNotesHTML: string;
};

export type ColorTheme = 'dark' | 'light' | 'blue' | 'sepia';

export const ALLOWED_COOKIES = [
  '_otwarchive_session',
  'user_credentials',
  'remember_user_token',
];

export type SavedHighlights = {[key: number]: Highlight};

export type Highlight = {
  creator?: string;
  id: number;
  chapterId: number;
  startTag: number;
  endTag: number;
  note: string;
  createdAt?: string;
};

export type FicLoadError = {
  failed: true;
  reason: 'AuthFailed' | 'FicNotFound' | 'InvalidFic';
};

export type ToolbarPosition = Partial<
  Pick<CSSProperties, 'top' | 'left' | 'right' | 'height' | 'width' | 'display'>
>;

export type ScrollPosition = {
  chapterId: number;
  scrollPosition: number;
};

export type UserWorkInfo = {
  finished: false,
  lastPausedPosition: ScrollPosition
}

export type AO3Work = {
  meta: WorkInfo;
  chapters: AO3Chapter[];
  metaDlHTML: string;
};

export type ChapterMeta = {
  relativeLink: string;
  title: string;
  id: number;
  count: number;
};

export type AO3Chapter = {
  meta: ChapterMeta;
  prefaceDivHTML: string;
  summaryDivHTML: string;
  startNotesDivHTML: string;
  endNotesDivHTML: string;
  titleH3HTML: string;
  textDivHTML: string;
};

export type workTags = {
  link: string;
  text: string;
};

export type WorkMeta = {
  rating?: workTags[] | string;
  warning?: workTags[] | string;
  category?: workTags[] | string;
  fandom?: workTags[] | string;
  relationship?: workTags[] | string;
  character?: workTags[] | string;
  freeform?: workTags[] | string;
  language?: workTags[] | string;
};

export type WorkStats = { [key: string]: string };
