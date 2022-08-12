import React from 'react';
import { bioHTML } from 'utils/bionify';
import { AO3Chapter } from 'utils/types';

type ChapterProps = {
  chapter: AO3Chapter;
};

export const Chapter = ({ chapter }: ChapterProps) => {
  return (
    <>
      <div className='chapter_title'>{chapter.meta.title}</div>
      <div className='chapter_text' dangerouslySetInnerHTML={{ __html: bioHTML(chapter.textDivHTML || '')}} />
    </>
  );
};
