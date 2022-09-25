import React from 'react';
import Lottie from 'lottie-react';

import * as Speedometer from '@/animations/97030-network-speed-animation.json';

export default function SpeedometerIcon() {
  return (
    <Lottie
      animationData={Speedometer}
      loop={true}
      style={{
        width: 50,
        height: 50,
      }}
    />
  );
}
