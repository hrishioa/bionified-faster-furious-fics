import { NextApiRequest, NextApiResponse } from 'next';
import { getCookiedClient } from 'utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    if (!req.body.workId || !req.body.authenticityToken)
      return res.status(200).json({
        success: false,
        message: 'Need a work and auth token!',
      });

    const client = getCookiedClient(req.cookies);

    if (!client)
      return res.status(200).json({
        success: false,
        message: 'Not enough cookies to authenticate',
      });

    const data: { [key: string]: string } = {
      authenticity_token: String(req.body.authenticityToken),
      'kudo[commentable_id]': String(req.body.workId),
      'kudo[commentable_type]': 'Work',
    };

    const headers = {
      accept: 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    };

    const url = 'https://archiveofourown.org/kudos.js';

    try {
      await client.post(url, new URLSearchParams(data), {headers});
    } catch(err) {
      // console.error(err);
      return res.status(200).json({
        success: false,
        message: 'Kudos probably already left!'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Kudos left!',
    });
  } else {
    return res.status(400);
  }
}
