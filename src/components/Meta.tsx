import React, { useState } from 'react';

export const Meta = (props: { contentHTML: string, title: string}) => {
  const [hidden, setHidden] = useState(false);

  return props.contentHTML.length ? (
    <div className='meta_data'>
      <div className='meta_data_title' onClick={() => setHidden(val => !val)}>{props.title}</div>
      <div className={`meta_data_content ${hidden ? 'meta_data_content_hidden': ''}`} dangerouslySetInnerHTML={{
        __html: props.contentHTML
      }}></div>
      <hr />
    </div>
): null
}