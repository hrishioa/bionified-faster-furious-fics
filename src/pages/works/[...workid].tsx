import { MemoizedChapter } from '@/components/Chapter';
import useRegisterChaptersInMenu from '@/components/CommandBar/SubMenus/useRegisterChaptersInMenu';
import { RootState } from '@/components/Redux-Store/ReduxStore';
import {
  setChapterMeta,
  setCurrentChapter,
  setScroll,
} from '@/components/Redux-Store/WorksSlice';
import { GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ALLOWED_COOKIES, getWorkId, loadWork } from 'utils/fics';
import { getChapterScrollPosition } from 'utils/scroll';
import { AO3Work } from 'utils/types';
import debounce from 'lodash/debounce';
import { setUsername } from '@/components/Redux-Store/UserSlice';

const WorkPage = (props: {
  work: AO3Work | null;
  cookies: string[] | null;
  selectedChapter: number | null;
}) => {
  const { work, cookies, selectedChapter } = props;
  const dispatch = useDispatch();
  const jumpToChapter = useSelector(
    (state: RootState) => state.work.jumpToChapter,
  );

  useEffect(() => {
    dispatch(setUsername(work?.meta.username || null));
  }, [work, dispatch]);

  useEffect(() => {
    const saveScrollPosition = debounce(() => {
      const { chapterId, scrollPosition } = getChapterScrollPosition(
        document,
        work?.chapters.map((chapter) => chapter.meta) || [],
      );
      dispatch(
        setScroll({ chapterId, scrollPercentage: scrollPosition * 100 }),
      );
      return;
    }, 100);

    if (document) {
      document.addEventListener('scroll', saveScrollPosition, {
        passive: true,
      });
    }

    return () => {
      saveScrollPosition.cancel();
      document.removeEventListener('scroll', saveScrollPosition);
    };
  }, [work, dispatch]);

  useEffect(() => {
    dispatch(
      setChapterMeta(work?.chapters.map((chapter) => chapter.meta) || []),
    );
  }, [work, dispatch]);

  useEffect(() => {
    dispatch(
      setCurrentChapter(selectedChapter || work?.chapters[0].meta.id || 0),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useRegisterChaptersInMenu(
    work?.chapters.map((chapter) => ({
      name: chapter.meta.title,
      count: chapter.meta.count,
      id: chapter.meta.id,
    })) || [],
    work?.chapters.length || 0,
  );

  console.log('Setting up chapter menus');

  return (
    <div>
      {work?.chapters.map((chapter) => (
        <MemoizedChapter
          jumpToThisChapter={
            (jumpToChapter && jumpToChapter === chapter.meta.id) || false
          }
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
