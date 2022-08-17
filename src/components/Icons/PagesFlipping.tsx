import React from 'react';
import Lottie from 'lottie-react';

import * as PagesFlipping from '@/animations/102286-flipping-pages.json';

export default function PagesFlippingIcon() {
  return (
      <Lottie
        animationData={PagesFlipping}
        loop={true}
        style={{
          width: 50,
          height: 50,
        }}
      />
  );
};
