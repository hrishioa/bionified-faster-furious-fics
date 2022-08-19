import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { ALLOWED_COOKIES } from 'utils/types';
import * as ToughCookie from 'tough-cookie';
import * as ACSupport from 'axios-cookiejar-support';
import { getCookiedClient } from 'utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
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

    const client = getCookiedClient(req.cookies);

    if(!client)
      return res.status(200).json({
        success: false,
        message: 'Not enough data to authenticate.'
      })

    const {
      data: subData,
      status: subStatus,
      request: subRequest,
    } = await client.post(url, new URLSearchParams(data), {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
      },
    });

    if (subRequest._redirectable._redirectCount > 0 || (subStatus !== 201 && subStatus != 200)) {
      return res.status(200).json({
        success: false,
        message: `Could not ${req.body.type}.`,
      });
    }

    return res.status(200).json({
      success: true,
      type: req.body.type,
      subscriptionId: subData.item_id || undefined,
      message: 'Completed.',
    });
  } else {
    return res.status(400);
  }
}
