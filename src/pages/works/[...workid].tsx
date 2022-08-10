import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { getWorkId, loadWork } from 'utils/fics';
import { AO3Work, WorkMeta } from 'utils/types';

const WorkPage = (work: WorkMeta | null) => {
  console.log('Got work ', work);
  return <div>Hello there - {JSON.stringify(work)}</div>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  console.log('got static props ', ctx.query);

  if (ctx.query.workid) {
    console.log(
      'Loading work ',
      Array.isArray(ctx.query.workid) ? ctx.query.workid[0] : ctx.query.workid,
    );
    const workId = getWorkId(
      Array.isArray(ctx.query.workid) ? ctx.query.workid[0] : ctx.query.workid,
    );
    if (!workId)
      return {
        props: {
          work: null,
        },
      };
    const work = await loadWork(workId);
    return {
      props: {
        work: work?.meta.workMeta,
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
