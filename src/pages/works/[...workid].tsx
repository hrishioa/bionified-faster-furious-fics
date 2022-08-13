import { Chapter } from 'components/Chapter';
import { GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { useEffect } from 'react';
import { bioHTML } from 'utils/bionify';
import { ALLOWED_COOKIES, getWorkId, loadWork } from 'utils/fics';
import { AO3Work, WorkMeta } from 'utils/types';

const WorkPage = (props: {
  work: AO3Work | null;
  cookies: string[] | null;
}) => {
  const { work, cookies } = props;

  useEffect(() => {
    console.log(
      `Loaded ${work?.chapters.length} chapters for work ${work?.meta.title}`,
    );

    console.log('Checking and loading cookies...');
    if (cookies) {
      cookies.map(
        (cookie) => (document.cookie = cookie.replace(/HttpOnly/i, '')),
      );
    }
  });

  return (
    <div>
      {work?.chapters.map((chapter) => (
        <Chapter chapter={chapter} key={chapter.meta.id} />
      ))}

      {/* <div dangerouslySetInnerHTML={{ __html: bioHTML(work?.chapters[0].textDivHTML || '')}} /> */}
    </div>
  );
};

function getChapterFromQuery(query: ParsedUrlQuery) {
  if (Array.isArray(query.workid)) {
    const cIndex = query.workid.findIndex((token) => token === 'chapters');
    console.log('cIndex is ', cIndex, ', length is ',);
    if (
      cIndex !== -1 &&
      query.workid.length >= cIndex + 2 &&
      !isNaN(parseInt((query.workid as string[])[cIndex + 1]))
    )
      return parseInt((query.workid as string[])[cIndex + 1]);
  }
  return null;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const allowedCookies = ALLOWED_COOKIES.reduce((acc, cur) => {
    const cookie = ctx.req.cookies[cur];
    if (cookie) acc.push(`${cur}=${cookie}`);
    return acc;
  }, [] as string[]);

  console.log(
    'Got query - ',
    ctx.query,
    ' Chapter - ',
    getChapterFromQuery(ctx.query),
  );

  if (ctx.query.workid) {
    const workId = getWorkId(
      Array.isArray(ctx.query.workid) ? ctx.query.workid[0] : ctx.query.workid,
    );
    if (!workId)
      return {
        props: {
          work: null,
        },
      };
    const workData = await loadWork(workId, allowedCookies);
    return {
      props: {
        work: workData?.work || null,
        cookies: workData?.cookies || null,
      },
    };
  } else {
    return {
      props: {
        work: null,
      },
    };
  }
};

export default WorkPage;
