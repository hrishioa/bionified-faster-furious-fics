import * as cheerio from 'cheerio';

export type WorkInfo = {
  id: number;
  title: string;
  authenticityToken: string;
  workMeta: WorkMeta;
  workStats: WorkStats;
};

export type AO3Work = {
  meta: WorkInfo;
  chapters: AO3Chapter[];
  metaDlHTML: string;
};

export type AO3Chapter = {
  meta: {
    relativeLink: string;
    title: string;
    id: string;
    count: number;
  };
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
