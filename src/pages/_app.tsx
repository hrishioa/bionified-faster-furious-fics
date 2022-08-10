import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import Script from 'next/script';
import Head from 'next/head';

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
      <Component {...pageProps} />
    </>
  );
}
