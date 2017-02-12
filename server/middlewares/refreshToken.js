import request from 'request-promise';

import { loadFromDb, insertOrUpdateDb } from '../db';
import { decrypt } from '../utils';

export default function (req, res, next) {
  const id = decrypt(req.cookies.tpdk);
  loadFromDb({ id })
    .then((token) => {
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          Authorization: `Basic ${new Buffer(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
        form: {
          grant_type: 'refresh_token',
          refresh_token: token.refresh_token,
        },
        json: true,
      };

      return request.post(authOptions).then(
        ({ access_token }) => {
          insertOrUpdateDb({
            id,
            access_token,
          });
          next();
        });
    });
}
