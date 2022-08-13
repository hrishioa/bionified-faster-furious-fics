import React from 'react';
import Lottie from 'lottie-react';
// import * as CatInABox from '@/animations/29718-cat-in-a-box.json';
import * as CatRotate from '@/animations/52831-rotation-cats.json';
import { useKBar } from 'kbar';
// import * as Cat from '@/animations/8874-cat.json';

export const CommandBarIcon = () => {
  const { query } = useKBar();

  return (
    <div
      style={{
        margin: '10px',
      }}
      onClick={() => query && query.toggle()}
    >
      <Lottie
        animationData={CatRotate}
        loop={true}
        style={{
          width: 50,
          height: 50,
        }}
      />
    </div>
  );
};
