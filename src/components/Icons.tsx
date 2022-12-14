import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const DarkModeIconBase = dynamic<any>(() => import('./Icons/DarkMode'), {
  suspense: true,
});
export const DarkModeIcon = () => {
  return (
    <Suspense fallback={'*'}>
      <DarkModeIconBase />
    </Suspense>
  );
};

const ChapterIconBase = dynamic<any>(() => import('./Icons/ChapterIcon'), {
  suspense: true,
});
export const ChapterIcon = () => {
  return (
    <Suspense fallback={'*'}>
      <ChapterIconBase />
    </Suspense>
  );
};

const PagesFlippingBase = dynamic<any>(() => import('./Icons/PagesFlipping'), {
  suspense: true,
});
export const PagesFlipping = () => {
  return (
    <Suspense fallback={'*'}>
      <PagesFlippingBase />
    </Suspense>
  );
};

const BadCatBase = dynamic<any>(() => import('./Icons/BadCat'), {
  suspense: true,
});
export const BadCat = () => {
  return (
    <Suspense fallback={'*'}>
      <BadCatBase />
    </Suspense>
  );
};

const LogoutBase = dynamic<any>(() => import('./Icons/Logout'), {
  suspense: true,
});
export const Logout = () => {
  return (
    <Suspense fallback={'*'}>
      <LogoutBase />
    </Suspense>
  );
};

const SubscribeBase = dynamic<any>(() => import('./Icons/Subscribe'), {
  suspense: true,
});
export const Subscribe = () => {
  return (
    <Suspense fallback={'*'}>
      <SubscribeBase />
    </Suspense>
  );
};

const UnsubscribeBase = dynamic<any>(() => import('./Icons/Unsubscribe'), {
  suspense: true,
});
export const Unsubscribe = () => {
  return (
    <Suspense fallback={'*'}>
      <UnsubscribeBase />
    </Suspense>
  );
};

const CollapseBase = dynamic<any>(() => import('./Icons/Collapse'), {
  suspense: true,
});
export const Collapse = () => {
  return (
    <Suspense fallback={'*'}>
      <CollapseBase />
    </Suspense>
  );
};

const FocusBase = dynamic<any>(() => import('./Icons/Focus'), {
  suspense: true,
});
export const Focus = () => {
  return (
    <Suspense fallback={'*'}>
      <FocusBase />
    </Suspense>
  );
};

const SpeedometerBase = dynamic<any>(() => import('./Icons/Speedometer'), {
  suspense: true,
});
export const Speedometer = () => {
  return (
    <Suspense fallback={'*'}>
      <SpeedometerBase />
    </Suspense>
  );
};
