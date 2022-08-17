import React from 'react';
import Lottie from 'lottie-react';

import * as DarkMode from '@/animations/112979-dark-mode.json';

export default function DarkModeIcon() {
  return (
      <Lottie
        animationData={DarkMode}
        loop={true}
        style={{
          width: 50,
          height: 50,
        }}
      />
  );
};
