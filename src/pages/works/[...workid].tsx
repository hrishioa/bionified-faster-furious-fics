import { GetServerSidePropsContext } from 'next';
import React, { useEffect } from 'react';
import { bioHTML } from 'utils/bionify';
import { ALLOWED_COOKIES, getWorkId, loadWork } from 'utils/fics';
import { AO3Work, WorkMeta } from 'utils/types';
import { createGzip } from 'zlib';

const WorkPage = (props: {
  work: AO3Work | null;
  cookies: string[] | null;
}) => {
  const { work, cookies } = props;

  useEffect(() => {
    if (cookies) {
      cookies.map(
        (cookie) => (document.cookie = cookie.replace(/HttpOnly/i, '')),
      );
    }
  });

  return <div className='chapter_text'>
  <div dangerouslySetInnerHTML={{ __html: bioHTML(work?.chapters[0].textDivHTML || '')}} />
  </div>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const allowedCookies = ALLOWED_COOKIES.reduce((acc, cur) => {
    const cookie = ctx.req.cookies[cur];
    if (cookie) acc.push(`${cur}=${cookie}`);
    return acc;
  }, [] as string[]);

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
