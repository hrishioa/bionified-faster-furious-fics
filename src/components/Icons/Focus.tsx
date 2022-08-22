import React from 'react';
import Lottie from 'lottie-react';

import * as Focus from '@/animations/54102-sunrise-breathe-in-breathe-out.json';

export default function FocusIcon() {
  return (
    <Lottie
      animationData={Focus}
      loop={true}
      style={{
        width: 50,
        height: 50,
      }}
    />
  );
}
