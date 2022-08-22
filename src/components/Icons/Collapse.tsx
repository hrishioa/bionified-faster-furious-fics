import React from 'react';
import Lottie from 'lottie-react';

import * as Collapse from '@/animations/93396-collapsing-x.json';

export default function CollapseIcon() {
  return (
    <Lottie
      animationData={Collapse}
      loop={true}
      style={{
        width: 50,
        height: 50,
      }}
    />
  );
}
