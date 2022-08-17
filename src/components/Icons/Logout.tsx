import React from 'react';
import Lottie from 'lottie-react';

import * as Logout from '@/animations/38063-log-out.json';

export default function LogoutIcon() {
  return (
    <Lottie
      animationData={Logout}
      loop={true}
      style={{
        width: 50,
        height: 50,
      }}
    />
  );
}
