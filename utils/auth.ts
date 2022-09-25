import { ALLOWED_COOKIES } from './types';
import * as ToughCookie from 'tough-cookie';
import * as ACSupport from 'axios-cookiejar-support';
import axios from 'axios';

export const DEVICE_ID_COOKIE = 'bf3_device_id';

export function getCookiedClient(
  cookies: Partial<{
    [key: string]: string;
  }>,
) {
  const allowedCookies = ALLOWED_COOKIES.reduce((acc, cur) => {
    const cookie = cookies[cur];
    if (cookie) acc.push(`${cur}=${encodeURIComponent(cookie)}`);
    return acc;
  }, [] as string[]);

  if (allowedCookies.length < 3) return null;

  const cookieJar = new ToughCookie.CookieJar();

  allowedCookies.map((cookie) =>
    cookieJar.setCookieSync(cookie, 'https://archiveofourown.org'),
  );

  const client = ACSupport.wrapper(axios.create({ jar: cookieJar }));

  return client;
}