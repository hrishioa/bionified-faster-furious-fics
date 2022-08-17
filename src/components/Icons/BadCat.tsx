import React from 'react';
import Lottie from 'lottie-react';

import * as BadCat from '@/animations/87174-bad-cat.json';

export default function BadCatIcon() {
  return (
      <Lottie
        animationData={BadCat}
        loop={true}
        style={{
          width: 50,
          height: 50,
        }}
      />
  );
};
