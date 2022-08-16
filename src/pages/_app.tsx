import '@/styles/globals.css';
import '@/styles/commandbar.css';
import '@/styles/chapters.css';
import '@/styles/funinput.css';
import '@/styles/ao3text.css';

import type { AppProps } from 'next/app';
import Script from 'next/script';
import Head from 'next/head';
import { CommandBar } from '@/components/CommandBar/CommandBar';
import { ReduxStore } from '@/components/Redux-Store/ReduxStore';
import { NavBar } from '@/components/Navbar';

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
      <ReduxStore>
        <CommandBar>
          <NavBar />
          <Component {...pageProps} />
        </CommandBar>
      </ReduxStore>
    </>
  );
}
