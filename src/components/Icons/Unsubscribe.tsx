import React from 'react';
import Lottie from 'lottie-react';

import * as Unsubscribe from '@/animations/12999-unsubscribe.json';

export default function UnsubscribeIcon() {
  return (
    <Lottie
      animationData={Unsubscribe}
      loop={true}
      style={{
        width: 50,
        height: 50,
      }}
    />
  );
}
