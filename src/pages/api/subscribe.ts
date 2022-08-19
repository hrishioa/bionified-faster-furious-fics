import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { ALLOWED_COOKIES } from 'utils/types';
import * as ToughCookie from 'tough-cookie';
import * as ACSupport from 'axios-cookiejar-support';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    console.log('subscribe endpoint got body ', req.body);

    if (!req.body.username || !req.body.authenticityToken)
      return res.status(200).json({
        success: false,
        message: 'No username or auth token found.',
      });

    let url = `https://archiveofourown.org/users/${req.body.username}/subscriptions`;

    if (!req.body.workId)
      return res.status(200).json({
        success: false,
        message: 'No workId',
      });

    const data: { [key: string]: string } = {
      authenticity_token: String(req.body.authenticityToken),
      'subscription[subscribable_id]': String(req.body.workId),
      'subscription[subscribable_type]': 'Work',
    };

    if (req.body.type !== 'unsubscribe' && req.body.type !== 'subscribe')
      return res.status(200).json({
        success: false,
        message: 'Unknown method.',
      });

    if (req.body.type === 'unsubscribe') {
      if (!req.body.subscriptionId)
        return res.status(200).json({
          success: false,
          message: 'No subscriptionId to unsubscribe.',
        });
      data['_method'] = 'delete';
      url += `/${req.body.subscriptionId}`;
    }

    console.log('Got cookies - ', req.cookies);

    const allowedCookies = ALLOWED_COOKIES.reduce((acc, cur) => {
      const cookie = req.cookies[cur];
      if (cookie) acc.push(`${cur}=${encodeURIComponent(cookie)}`);
      return acc;
    }, [] as string[]);

    console.log('Allowed cookies - ', allowedCookies);

    // if (allowedCookies.length < 3)
    //   return res.status(200).json({
    //     success: false,
    //     message: 'Not enough auth information.',
    //   });

    const cookieJar = new ToughCookie.CookieJar();

    allowedCookies.map((cookie) =>
      cookieJar.setCookieSync(cookie, 'https://archiveofourown.org'),
    );

    const client = ACSupport.wrapper(axios.create({ jar: cookieJar }));

    console.log('Calling ', url, ' with ', data);

    const {
      data: subData,
      status: subStatus,
      request: subRequest,
    } = await client.post(url, new URLSearchParams(data), {
      headers: {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest'
      },
    });

    // console.log('subRequest - ', subRequest);
    // console.log('subData - ', subData);
    console.log('subStatus - ', subStatus);


    if(subRequest._redirectable._redirectCount > 0) {
      console.log('Redirected, likely failed, redirected to ',subRequest._redirectable._currentUrl);
    } else {
      console.log('Seems to have subscribed - ',subData);
    }

    return res.status(200).json({
      success: true,
      message: 'Work done.',
    });
  } else {
    return res.status(400);
  }
}
