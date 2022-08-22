import React, { useEffect, useState } from 'react';
import { useAppStoreDispatch, useAppStoreSelector } from './Redux-Store/hooks';
import { setMetaDisplayState } from './Redux-Store/UserSlice';

export const Meta = (props: { contentHTML: string; title: string }) => {
  const [hidden, setHidden] = useState(false);
  const allMetaDisplayState = useAppStoreSelector(
    (state) => state.user.displayPreferences.allMetaDisplayState,
  );
  const dispatch = useAppStoreDispatch();
  const focusMode = useAppStoreSelector(
    (state) => state.user.displayPreferences.focusMode,
  );

  useEffect(() => {
    if (allMetaDisplayState === 'collapsed') setHidden(true);
    else if (allMetaDisplayState === 'expanded') setHidden(false);
  }, [allMetaDisplayState]);

  return !focusMode && props.contentHTML.length ? (
    <div className="meta_data">
      <div
        className="meta_data_title"
        onClick={() => {
          setHidden((val) => !val);
          if (allMetaDisplayState !== null) dispatch(setMetaDisplayState(null));
        }}
      >
        {props.title}
      </div>
      <div
        className={`meta_data_content ${
          hidden ? 'meta_data_content_hidden' : ''
        }`}
        dangerouslySetInnerHTML={{
          __html: props.contentHTML,
        }}
      ></div>
      <hr />
    </div>
  ) : null;
};
