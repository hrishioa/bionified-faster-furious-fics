import '@/styles/globals.scss';
import '@/styles/commandbar.css';
import '@/styles/chapters.scss';
import '@/styles/ao3text.css';
import '@/styles/login.scss';

import type { AppProps } from 'next/app';
import Script from 'next/script';
import Head from 'next/head';
import { CommandBar } from '@/components/CommandBar/CommandBar';
import { ReduxStore } from '@/components/Redux-Store/ReduxStore';
import { HighlightToolbar } from '@/components/HighlightToolbar';
import { Toaster } from 'react-hot-toast';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src={'https://www.googletagmanager.com/gtag/js?id=G-PB9RTRPM7W'}
      />
      <Script strategy="lazyOnload" id="ga-load">
        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-PB9RTRPM7W');
      `}
      </Script>
      <Head>
        <title>FuriousFics</title>
      </Head>
      <Toaster position="top-left" reverseOrder={true} />
      <ReduxStore>
        <CommandBar>
          <Component {...pageProps} />
        </CommandBar>
        <HighlightToolbar />
      </ReduxStore>
    </>
  );
}
