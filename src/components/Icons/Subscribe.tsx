import React from 'react';
import Lottie from 'lottie-react';

import * as Subscribe from '@/animations/116073-subscribe-tick.json';

export default function SubscribeIcon() {
  return (
    <Lottie
      animationData={Subscribe}
      loop={true}
      style={{
        width: 50,
        height: 50,
      }}
    />
  );
}
