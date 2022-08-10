import * as cheerio from 'cheerio';

export type AO3Work = {
  meta: {
    id: number;
    title: string;
    authenticityToken: string;
    workMeta: WorkMeta;
    workStats: WorkStats;
  };
  chapters: AO3Chapter[];
  metaDl: cheerio.Cheerio<cheerio.Element>;
};

export type AO3Chapter = {
  meta: {
    relativeLink: string;
    title: string;
    id: string;
    count: number;
  };
  prefaceDiv: cheerio.Cheerio<cheerio.Element>;
  summaryDiv: cheerio.Cheerio<cheerio.Element>;
  startNotesDiv: cheerio.Cheerio<cheerio.Element>;
  endNotesDiv: cheerio.Cheerio<cheerio.Element>;
  titleH3: cheerio.Cheerio<cheerio.Element>;
  textDiv: cheerio.Cheerio<cheerio.Element>;
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
