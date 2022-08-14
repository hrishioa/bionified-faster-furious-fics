import { MemoizedChapter } from '@/components/Chapter';
import useRegisterChaptersInMenu from '@/components/CommandBar/SubMenus/useRegisterChaptersInMenu';
import { GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { useEffect, useState } from 'react';
import { ALLOWED_COOKIES, getWorkId, loadWork } from 'utils/fics';
import { AO3Work } from 'utils/types';

const WorkPage = (props: {
  work: AO3Work | null;
  cookies: string[] | null;
  selectedChapter: number | null;
}) => {
  const { work, cookies, selectedChapter } = props;

  const [activeChapter, setActiveChapter] = useState(null as number | null);

  useEffect(() => {
    setActiveChapter(selectedChapter);
  }, []);

  useEffect(() => {
    (window as any).work = work;

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

  useEffect(() => {
    console.log('active chapter changed in work to ', activeChapter);
  }, [activeChapter]);

  useRegisterChaptersInMenu(
    work?.chapters.map((chapter) => ({
      name: chapter.meta.title,
      count: chapter.meta.count,
      id: chapter.meta.id,
    })) || [],
    work?.chapters.length || 0,
    setActiveChapter,
  );

  console.log('Setting up chapter menus');

  return (
    <div>
      {work?.chapters.map((chapter) => (
        <MemoizedChapter
          selected={activeChapter === chapter.meta.id}
          chapter={chapter}
          key={chapter.meta.id}
        />
      ))}
    </div>
  );
};

function getChapterFromQuery(query: ParsedUrlQuery) {
  if (Array.isArray(query.workid)) {
    const cIndex = query.workid.findIndex((token) => token === 'chapters');
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

  const selectedChapter = getChapterFromQuery(ctx.query);

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
        selectedChapter,
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
