import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const DarkModeIconBase = dynamic<any>(() => import('./Icons/DarkMode'), {suspense: true});
export const DarkModeIcon = () => {
  return (
    <Suspense fallback={'*'}>
      <DarkModeIconBase />
    </Suspense>
  )
}

const ChapterIconBase = dynamic<any>(() => import('./Icons/ChapterIcon'), {suspense: true});
export const ChapterIcon = () => {
  return (
    <Suspense fallback={'*'}>
      <ChapterIconBase />
    </Suspense>
  )
}

const PagesFlippingBase = dynamic<any>(() => import('./Icons/PagesFlipping'), {suspense: true});
export const PagesFlipping = () => {
  return (
    <Suspense fallback={'*'}>
      <PagesFlippingBase />
    </Suspense>
  )
}

const BadCatBase = dynamic<any>(() => import('./Icons/BadCat'), {suspense: true});
export const BadCat = () => {
  return (
    <Suspense fallback={'*'}>
      <BadCatBase />
    </Suspense>
  )
}