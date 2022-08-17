import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import * as dotenv from 'dotenv';
import * as ToughCookie from 'tough-cookie';
import * as ACSupport from 'axios-cookiejar-support';
import {
  AO3Chapter,
  AO3Work,
  FicLoadError,
  WorkMeta,
  WorkStats,
  workTags,
} from './types';

dotenv.config({ path: __dirname + '../.env' });

function getTimeTag() {
  return (Math.random() + 1).toString(36).substring(7);
}

export function getWorkId(queryToken: string) {
  const workId = parseInt(queryToken);
  if (!isNaN(workId)) return workId;
  else return null;
}

export async function authenticate(credentials: {
  username: string;
  password: string;
}): Promise<{
  client: AxiosInstance;
  cookieJar: ToughCookie.CookieJar;
  userAuthToken: string;
} | null> {
  const runTag = getTimeTag();

  console.time(`${runTag} - Authenticated             `);
  try {
    const jar = new ToughCookie.CookieJar();
    const client = ACSupport.wrapper(axios.create({ jar }));

    console.time(`${runTag} - Getting authenticity token`);
    const { data: loginPageData, status: loginPageStatus } = await client.get(
      'https://archiveofourown.org/users/login',
    );
    const $ = cheerio.load(loginPageData);
    const authenticityToken = $('[name=authenticity_token]').val();
    console.timeEnd(`${runTag} - Getting authenticity token`);

    if (!authenticityToken) {
      console.error('Authentication failure - ', loginPageStatus);
      return null;
    }

    const params = new URLSearchParams({
      authenticity_token: authenticityToken as string,
      'user[login]': credentials.username,
      'user[password]': credentials.password,
      'user[remember_me]': '1',
      commit: 'Log In',
    });

    console.time(`${runTag} - Logging in                `);
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
          `https://archiveofourown.org/users/${credentials.username}`
      )
    ) {
      console.error('Credentials did not work.'); // Add more info here
      return null;
    }
    console.timeEnd(`${runTag} - Logging in                `);

    console.timeEnd(`${runTag} - Authenticated             `);

    console.time(`${runTag} - Getting authenticity_token`);
    const { data: authTokenData } = await client.get(
      `https://archiveofourown.org/users/${credentials.username}`,
    );

    const authTokenDOM = cheerio.load(authTokenData);

    const userAuthToken = authTokenDOM('[name=authenticity_token]').val();

    return {
      client,
      userAuthToken:
        (Array.isArray(userAuthToken) ? userAuthToken[0] : userAuthToken) || '',
      cookieJar: jar,
    };
  } catch (err) {
    console.error('Error authenticating - ', err);
    return null;
  }
}

export async function loadWork(
  workId: number,
  cookies: string[],
  singleRetry?: boolean,
): Promise<
  | {
      work: AO3Work;
      cookies: string[];
      workDOM: cheerio.CheerioAPI;
    }
  | FicLoadError
> {
  let client: AxiosInstance | null = null;
  const cookieJar = new ToughCookie.CookieJar();

  if (cookies.length) {
    cookies.map((cookie) =>
      cookieJar.setCookieSync(cookie, 'https://archiveofourown.org'),
    );

    client = ACSupport.wrapper(axios.create({ jar: cookieJar }));
  } else {
    console.log('No cookies found');
    return { failed: true, reason: 'AuthFailed' };
  }

  const runTag = getTimeTag();

  console.time(`${runTag} - Loading fic ${workId}`);
  const {
    data: workData,
    status: workStatus,
    request: workRequest,
  } = await client
    .get(
      `https://archiveofourown.org/works/${workId}?view_adult=true&view_full_work=true`,
    )
    .catch((error) => {
      console.error('Error loading fic - ', error);
      if (error.response) return error.response;
      else return null;
    });

  if (!workData)
    return {
      failed: true,
      reason: 'InvalidFic',
    };

  console.timeEnd(`${runTag} - Loading fic ${workId}`);

  if (workRequest._redirectable._redirectCount > 0 || workStatus !== 200) {
    console.log('Work seems redirected, retrying...');
    if (!singleRetry) return loadWork(workId, [], true);
    else {
      console.log('Skipping because we already retried');
      return {
        failed: true,
        reason: 'AuthFailed',
      };
    }
  }

  const workDOM = cheerio.load(workData);

  if (!workDOM('div#greeting').length && !singleRetry) {
    console.log("Work doesn't have a greeting, running auth again.");
    return loadWork(workId, [], true);
  }

  const username = getUsernameFromWork(workDOM);

  const heading = workDOM('h2.heading').text();

  const processedWork = processWork(workDOM, workId);

  processedWork.meta.username = username;

  if (heading.toLowerCase().includes('error 404')) {
    console.error('Could not find fic');
    return {
      failed: true,
      reason: 'FicNotFound',
    };
  }

  console.log(
    'Got cookies from work ',
    await cookieJar.getSetCookieStrings('https://archiveofourown.org/'),
    ', also - ',
    await cookieJar.getSetCookieStrings('https://archiveofourown.org/works/9848762?view_adult=true&view_full_work=true')
  );

  return {
    work: processedWork,
    workDOM,
    cookies: await cookieJar.getSetCookieStrings('https://archiveofourown.org'),
  };
}

function getUsernameFromWork(workDOM: cheerio.CheerioAPI): string | null {
  let username: null | string = null;

  const greetingDiv = workDOM('div#greeting');
  if (!greetingDiv.length) return username;

  const greetingLinks = greetingDiv
    .find('a')
    .toArray()
    .forEach((link) => {
      if (link && link.attribs && link.attribs.href) {
        const match = link.attribs.href.match(
          /\/users\/([\w\W]+)\/preferences/,
        );
        if (match && match.length > 1) username = match[1];
      }
    });

  return username;
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

  if (chapters.length === 0) {
    chapters.push(loadChapter(workDOM('div#workskin')));
  }

  const authenticityToken = workDOM(
    '[name=authenticity_token]',
  ).val() as string;

  const metaDl = workDOM('dl.work.meta.group');

  const title = workDOM('h2.heading').text();

  const { meta: workMeta, stats: workStats } = extractMeta(workDOM);

  let subscribeId: number | null = null;

  const subscribeLink = workDOM('ul.work.navigation.actions')
    .find('li.subscribe')
    .find('form')
    .attr('action');
  if (subscribeLink) {
    const subscribeTags = subscribeLink.split('/');
    console;
    if (!isNaN(parseInt(subscribeTags[subscribeTags.length - 1])))
      subscribeId = parseInt(subscribeTags[subscribeTags.length - 1]);
  }

  console.timeEnd('Processed fic');

  return {
    meta: {
      title,
      username: null,
      id: workId,
      subscribeId,
      authenticityToken,
      workMeta,
      workStats,
    },
    chapters,
    metaDlHTML: metaDl.html() || '',
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
  let prefaceDiv = chapterDiv.find('div.preface.module.group');
  if (!prefaceDiv.length) prefaceDiv = chapterDiv.find('div.preface.group');
  let summaryDiv = chapterDiv.find('div#summary');
  if (!summaryDiv.length) summaryDiv = chapterDiv.find('div.summary.module');
  let startNotesDiv = chapterDiv.find('div#notes');
  if (!startNotesDiv.length) startNotesDiv = chapterDiv.find('div.notes');

  const count = parseInt((chapterDiv.attr('id') as string).split('-')[1]);

  const endNotesDiv =
    (!isNaN(count) && chapterDiv.find(`div#chapter_${count}_endnotes`)) || null;
  let titleH3 = chapterDiv.find('h3.title');
  if (!titleH3.length) titleH3 = chapterDiv.find('h2.title');
  const textDiv = chapterDiv.find('div[role=article]');

  const chapterRelLink =
    chapterDiv.find('h3.title').find('a').attr('href') || '';
  const id = chapterRelLink.split('/')[chapterRelLink.split('/').length - 1];

  const title = cleanString(titleH3.text());

  return {
    meta: {
      relativeLink: chapterRelLink,
      title,
      id: parseInt(id),
      count,
    },
    prefaceDivHTML: prefaceDiv.html() || '',
    summaryDivHTML: summaryDiv.html() || '',
    startNotesDivHTML: startNotesDiv?.html() || '',
    endNotesDivHTML:
      (endNotesDiv && endNotesDiv.length && endNotesDiv.html()) || '',
    titleH3HTML: titleH3.html() || '',
    textDivHTML: textDiv.html() || '',
  };
}

// async function verifyAuth(client: AxiosInstance) {
//   console.log(`Veriyfing Login Status for ${process.env.AO3_USERNAME}     `);
//   const { request: checkRequest } = await client.get(
//     `https://archiveofourown.org/users/${process.env.AO3_USERNAME}/preferences`,
//   );

//   if (checkRequest._redirectable._redirectCount > 0) {
//     console.error('Failed to log in.');
//     return false;
//   }

//   console.log('Login verified');
//   return true;
// }
