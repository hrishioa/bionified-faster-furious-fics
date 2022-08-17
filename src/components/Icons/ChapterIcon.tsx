import React from 'react';
import Lottie from 'lottie-react';

import * as Chapter from '@/animations/35184-book-with-bookmark.json';

export default function DarkModeIcon() {
  return (
    <Lottie
      animationData={Chapter}
      loop={true}
      style={{
        width: 50,
        height: 50,
      }}
    />
  );
}
