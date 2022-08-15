import type { AppProps } from 'next/app';
import Script from 'next/script';
import Head from 'next/head';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useEffect, useState } from 'react';
import { CommandBar } from '@/components/CommandBar/CommandBar';
import { CommandBarIcon } from '@/components/CommandBar/CommandBarIcon';

import '@/styles/globals.css';
import '@/styles/commandbar.css';
import '@/styles/chapters.css';
import '@/styles/funinput.css';
import '@/styles/ao3text.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (document) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

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
      <CommandBar>
        <div className="theme-switch-container">
          <DarkModeSwitch
            checked={theme === 'dark'}
            style={{
              margin: '10px',
            }}
            onChange={() =>
              setTheme((theme) => (theme === 'light' ? 'dark' : 'light'))
            }
            size={50}
            moonColor="var(--heading-color)"
            sunColor="var(--heading-color)"
          />
          <CommandBarIcon />
        </div>
        <Component {...pageProps} />
      </CommandBar>
    </>
  );
}
