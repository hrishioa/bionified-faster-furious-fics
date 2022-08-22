import { MemoizedChapter } from '@/components/Chapter';
import useRegisterChaptersInMenu from '@/components/CommandBar/SubMenus/useRegisterChaptersInMenu';
import { RootState } from '@/components/Redux-Store/ReduxStore';
import {
  jumpToChapter,
  setChapterMeta,
  setCurrentChapter,
  setScroll,
  setWorkInfo,
} from '@/components/Redux-Store/WorksSlice';
import { GetServerSidePropsContext } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWorkId, loadWork } from 'utils/fics';
import { getChapterScrollPosition } from 'utils/scroll';
import { ALLOWED_COOKIES, AO3Work } from 'utils/types';
import debounce from 'lodash/debounce';
import { setUsername } from '@/components/Redux-Store/UserSlice';
import Head from 'next/head';
import { NavBar } from '@/components/Navbar';
import useSubscribeActions from '@/components/CommandBar/SubMenus/useSubscribeActions';
import useFocusActions from '@/components/CommandBar/SubMenus/useFocusActions';
import { Meta } from '@/components/Meta';

const WorkPage = (props: {
  work: AO3Work;
  cookies: string[] | null;
  selectedChapter: number | null;
}) => {
  const { work, cookies, selectedChapter } = props;
  const dispatch = useDispatch();
  const jumpedChapter = useSelector(
    (state: RootState) => state.work.jumpToChapter,
  );

  useEffect(() => {
    dispatch(setWorkInfo(work.meta));
    dispatch(setUsername(work?.meta.username || null));
  }, [dispatch, work.meta]);

  useSubscribeActions();
  useFocusActions();

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
    if (selectedChapter) dispatch(jumpToChapter(selectedChapter));
  }, [selectedChapter, dispatch]);

  useEffect(() => {
    dispatch(
      setCurrentChapter(selectedChapter || work?.chapters[0].meta.id || 0),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (window as any).work = work;
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

  return (
    <>
      <NavBar />
      <Head>
        <title>{work?.meta.title + ' - BF3' || 'FuriousFics'}</title>
      </Head>
      <div className="work">
        <div className="work_meta_data">
          <Meta contentHTML={work.meta.summaryHTML} title="Summary" />
          <Meta contentHTML={work.meta.startNotesHTML} title="Notes" />
        </div>
        <div>
          {work?.chapters.map((chapter) => (
            <MemoizedChapter
              jumpToThisChapter={
                (jumpedChapter && jumpedChapter === chapter.meta.id) || false
              }
              chapter={chapter}
              key={chapter.meta.id}
            />
          ))}
        </div>
        <hr />
        <div className="work_meta_data">
          <Meta contentHTML={work.meta.endNotesHTML} title="End Notes" />
        </div>
      </div>
    </>
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
        redirect: {
          permanent: false,
          destination: '/login?ficnotfound=true',
        },
      };

    if (allowedCookies.length < 2) {
      return {
        redirect: {
          permanent: false,
          destination: `/login?when_successful=${ctx.resolvedUrl}`,
        },
      };
    }
    const workData = await loadWork(workId, allowedCookies);

    if ('failed' in workData) {
      if (workData.reason === 'AuthFailed')
        return {
          redirect: {
            permanent: false,
            destination: `/login?when_successful=${ctx.resolvedUrl}`,
          },
        };
      else
        return {
          redirect: {
            permanent: false,
            destination: '/login?ficnotfound=true',
          },
        };
    }

    return {
      props: {
        work: workData?.work || null,
        cookies: workData?.cookies || null,
        selectedChapter,
      },
    };
  } else {
    return {
      redirect: {
        permanent: false,
        destination: '/login?ficnotfound=true',
      },
    };
  }
};

export default WorkPage;
