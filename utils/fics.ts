import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
import * as ToughCookie from 'tough-cookie';
import * as ACSupport from 'axios-cookiejar-support';
import { AO3Chapter, AO3Work, WorkMeta, WorkStats, workTags } from './types';

dotenv.config({ path: __dirname + '../.env' });

console.log('Loaded fic script.');

export function getWorkId(queryToken: string) {
  const workId = parseInt(queryToken);
  if (!isNaN(workId)) return workId;
  else return null;
}

async function authenticate(): Promise<AxiosInstance | null> {
  console.time('Authenticated             ');
  try {
    const jar = new ToughCookie.CookieJar();
    const client = ACSupport.wrapper(axios.create({ jar }));

    console.time('Getting authenticity token');
    const { data: loginPageData, status: loginPageStatus } = await client.get(
      'https://archiveofourown.org/users/login',
    );
    const $ = cheerio.load(loginPageData);
    const authenticityToken = $('[name=authenticity_token]').val();
    console.timeEnd('Getting authenticity token');

    if (!authenticityToken) {
      console.error('Authentication failure - ', loginPageStatus);
      return null;
    }

    const params = new URLSearchParams({
      authenticity_token: authenticityToken as string,
      'user[login]': process.env.AO3_USERNAME as string,
      'user[password]': process.env.AO3_PASSWORD as string,
    });

    console.log('Authenticating with ', params);

    console.time('Logging in                ');
    const { status: authStatus, request: authRequest } = await client.post(
      'https://archiveofourown.org/users/login',
      params,
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (
      !(
        authRequest._redirectable._redirectCount > 0 &&
        authStatus == 200 &&
        authRequest._redirectable._options.href ===
          `https://archiveofourown.org/users/${process.env.AO3_USERNAME}`
      )
    ) {
      console.error('Credentials did not work.'); // Add more info here
      return null;
    }
    console.timeEnd('Logging in                ');

    console.time('Checking Login Status     ');
    const { request: checkRequest } = await client.get(
      `https://archiveofourown.org/users/${process.env.AO3_USERNAME}/preferences`,
    );

    if (checkRequest._redirectable._redirectCount > 0) {
      console.error('Failed to log in.');
      return null;
    }
    console.timeEnd('Checking Login Status     ');
    console.timeEnd('Authenticated             ');

    return client;
  } catch (err) {
    console.error('Error authenticating - ', err);
    return null;
  }
}

export async function loadWork(
  workId: number,
  client?: AxiosInstance,
): Promise<AO3Work | null> {
  if (!client) {
    const newClient = await authenticate();
    if (!newClient) return null;
    client = newClient;
  }

  console.time(`Loading fic ${workId}`);
  const { data: workData, status: workStatus } = await client
    .get(
      `https://archiveofourown.org/works/${workId}?view_adult=true&view_full_work=true`,
    )
    .catch((error) => {
      console.error('Error loading fic - ', error);
      if (error.response) return error.response;
      else return null;
    });
  console.timeEnd(`Loading fic ${workId}`);

  if (workStatus !== 200) return null;

  const workDOM = cheerio.load(workData);

  const heading = workDOM('h2.heading').text();

  if (heading.toLowerCase().includes('error 404')) {
    console.error('Could not find fic');
    return null;
  }

  return processWork(workDOM, workId);
}

function processWork(workDOM: cheerio.CheerioAPI, workId: number): AO3Work {
  console.time('Processed fic');
  const chapterCount = parseInt(workDOM('dd.chapters').text().split('/')[0]);

  const chapters: AO3Chapter[] = [];

  for (let chapterId = 1; chapterId < chapterCount + 1; chapterId++) {
    const chapterDiv = workDOM(`div#chapter-${chapterId}`);
    if (!chapterDiv.length) continue;
    chapters.push(loadChapter(chapterDiv));
  }

  const authenticityToken = workDOM(
    '[name=authenticity_token]',
  ).val() as string;

  const metaDl = workDOM('dl.work.meta.group');

  const title = workDOM('h2.heading').text();

  const { meta: workMeta, stats: workStats } = extractMeta(workDOM);

  console.timeEnd('Processed fic');

  return {
    meta: {
      title,
      id: workId,
      authenticityToken,
      workMeta,
      workStats,
    },
    chapters,
    metaDl,
  };
}

function extractMeta(workDOM: cheerio.CheerioAPI): {
  meta: WorkMeta;
  stats: WorkStats;
} {
  const PROPERTIES_TO_LOAD: {
    [key: string]: { tags: boolean };
  } = {
    rating: { tags: true },
    warning: { tags: true },
    category: { tags: true },
    fandom: { tags: true },
    relationship: { tags: true },
    character: { tags: true },
    freeform: { tags: true },
    language: { tags: false },
  };

  const meta: WorkMeta = {};

  Object.keys(PROPERTIES_TO_LOAD).forEach((key) => {
    const dataContainer = workDOM('dl.work.meta.group').find(`dd.${key}`);
    if (!dataContainer.length) return;
    if (PROPERTIES_TO_LOAD[key].tags) {
      meta[key as keyof WorkMeta] = extractTags(workDOM, dataContainer);
    } else {
      meta[key as keyof WorkMeta] = cleanString(dataContainer.text());
    }
  });

  const statsData = workDOM('dl.work.meta.group')
    .find('dl.stats')
    .find('dd')
    .toArray()
    .map((stat) => workDOM(stat));

  const stats = statsData.reduce((acc, cur) => {
    const className = cur.attr('class');
    if (className && className.indexOf(' ') == -1) {
      acc[className] = cur.text();
    }
    return acc;
  }, {} as { [key: string]: string });

  return { meta, stats };
}

function extractTags(
  workDOM: cheerio.CheerioAPI,
  tagContainer: cheerio.Cheerio<cheerio.Element>,
): workTags[] {
  return tagContainer
    .find('a.tag')
    .toArray()
    .map((t) => workDOM(t))
    .map((tElement) => ({
      link: tElement.attr('href') || '',
      text: cleanString(tElement.text()),
    }));
}

function cleanString(text: string): string {
  return text.replace(/^[\n\s]+/, '').replace(/[\n\s]+$/, '');
}

function loadChapter(chapterDiv: cheerio.Cheerio<cheerio.Element>): AO3Chapter {
  const prefaceDiv = chapterDiv.find('div.chapter.preface.group');
  const summaryDiv = chapterDiv.find('div#summary');
  const startNotesDiv = chapterDiv.find('div#notes');
  const endNotesDiv = chapterDiv.find('div#chapter_2_endnotes');
  const titleH3 = chapterDiv.find('h3.title');
  const textDiv = chapterDiv.find('div[role=article]');

  const count = parseInt((chapterDiv.attr('id') as string).split('-')[1]);
  const chapterRelLink =
    chapterDiv.find('h3.title').find('a').attr('href') || '';
  const id = chapterRelLink.split('/')[chapterRelLink.split('/').length - 1];

  const title = cleanString(titleH3.text());

  return {
    meta: {
      relativeLink: chapterRelLink,
      title,
      id,
      count,
    },
    prefaceDiv,
    summaryDiv,
    startNotesDiv,
    endNotesDiv,
    titleH3,
    textDiv,
  };
}
