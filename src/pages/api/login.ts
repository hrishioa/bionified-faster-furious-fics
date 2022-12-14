import { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from 'utils/fics';

type LoginResponse = {
  success: boolean;
  error?: string;
  cookies?: string[];
  username?: string;
  userAuthToken?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>,
) {
  if (req.method === 'POST') {
    if (req.body.username && req.body.password) {
      try {
        const authResult = await authenticate({
          username: req.body.username,
          password: req.body.password,
        });

        if (authResult)
          return res.status(200).json({
            success: true,
            username: req.body.username,
            userAuthToken: authResult.userAuthToken,
            cookies: await authResult.cookieJar.getSetCookieStrings(
              'https://archiveofourown.org',
            ),
          });
        else
          return res.status(200).json({
            success: false,
          });
      } catch (err) {
        return res.status(200).json({
          success: false,
          error: (err as Error).message,
        });
      }
    }
  } else {
    return res.status(405);
  }
}
