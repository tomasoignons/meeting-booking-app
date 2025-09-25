import { defineEventHandler } from 'h3';
import axios from 'axios';
import jwt from 'jsonwebtoken';

console.log(process.env.GOOGLE_PROJECT_ID);

const serviceAccount = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  token_uri: process.env.GOOGLE_TOKEN_URI,
};


async function getAccessToken() {
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: serviceAccount.token_uri,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' });

  const response = await axios.post(serviceAccount.token_uri, {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: token,
  });

  return response.data.access_token;
}

export default defineEventHandler(async () => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${process.env.CALENDAR_ID}/events`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        timeMin: new Date().toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      },
    });

	// Debugging output to verify the structure of the fetched events
	if (!response.data.items || !Array.isArray(response.data.items)) {
	  throw new Error('Invalid response structure from Google Calendar API');
	}

    return response.data.items.map(event => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Error fetching events');
  }
});
