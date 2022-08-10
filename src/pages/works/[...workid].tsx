import { GetServerSidePropsContext } from 'next';
import React, { useEffect } from 'react';
import { ALLOWED_COOKIES, getWorkId, loadWork } from 'utils/fics';
import { AO3Work, WorkMeta } from 'utils/types';
import { createGzip } from 'zlib';

const WorkPage = (props: {
  work: WorkMeta | null;
  cookies: string[] | null;
}) => {
  const { work, cookies } = props;

  useEffect(() => {
    if (cookies) {
      cookies.map(
        (cookie) => (document.cookie = cookie.replace(/HttpOnly/i, '')),
      );
      console.log('Set cookies - ', cookies);
    }
  });

  return <div>Hello there - {JSON.stringify(work)}</div>;
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
        work: workData?.work.meta.workMeta || null,
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
