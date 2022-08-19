import React, { useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

import * as Heart from '@/animations/7596-like.json';
import { useAppStoreDispatch, useAppStoreSelector } from './Redux-Store/hooks';
import { addKudos } from './Redux-Store/WorksSlice';

export default function Kudos() {
  const kudosCount = useAppStoreSelector(state => state.work.workInfo?.kudos || 0);
  const lottieRef = useRef(null as LottieRefCurrentProps | null);
  const workId = useAppStoreSelector(state => state.work.workInfo?.id);
  const authenticityToken = useAppStoreSelector(state => state.work.workInfo?.authenticityToken);
  const dispatch = useAppStoreDispatch();

  function kudosLeft() {
    if(lottieRef.current) {
      lottieRef.current.goToAndPlay(0);
    }

    if(workId && authenticityToken) {
      window.fetch('/api/kudos', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          workId,
          authenticityToken
        })
      }).then(async res => {
        if(res.status === 200) {
          const data = await res.json();
          if(data.success)
            dispatch(addKudos());
        }
      })
    }

  }

  return (
    <div className='kudos-icon' onClick={kudosLeft}>
      <Lottie
        animationData={Heart}
        loop={1}
        autoplay={false}
        lottieRef={lottieRef}
        className='kudos-lottie'
        style={{
          width: 80,
          height: 80,
          marginTop: '-15px'
        }}
      />
      <div className='kudos-count'>
        {kudosCount}
      </div>
    </div>
  );
}
