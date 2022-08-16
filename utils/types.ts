import * as cheerio from 'cheerio';
import { CSSProperties } from 'react';

export type WorkInfo = {
  id: number;
  title: string;
  username: string | null;
  authenticityToken: string;
  subscribeId: number | null;
  workMeta: WorkMeta;
  workStats: WorkStats;
};

export type ToolbarPosition = Partial<
Pick<CSSProperties, 'top' | 'left' | 'right' | 'height' | 'width' | 'display'>
>;

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
