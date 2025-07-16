import { defineEventHandler, readBody } from 'h3';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'meetings' } }
);

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

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;
  if (!id) {
    return { error: 'Missing meeting id' };
  }
  // Fetch meeting to get Google Calendar event id and emails
  const { data: meeting, error: fetchError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError || !meeting) {
    return { error: 'Meeting not found' };
  }
  // Delete Google Calendar event
  try {
    const accessToken = await getAccessToken();
    await axios.delete(
      `https://www.googleapis.com/calendar/v3/calendars/${process.env.CALENDAR_ID}/events/${meeting.google_calendar_event_id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (err) {
    // Log but do not block deletion if event is already gone
    console.error('Failed to delete Google Calendar event:', err.response?.data || err.message);
  }
  // Delete from Supabase
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id);
  if (error) {
    return { error: error.message };
  }
  // Send notification emails
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  const userMailText = `Your meeting has been cancelled.\nIf this was a mistake, please book a new meeting.`;
  const adminMailText = `Meeting cancelled by ${meeting.booker_name} (${meeting.booker_email}).`;
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: meeting.booker_email,
    subject: 'Your Meeting Has Been Cancelled',
    text: userMailText,
  });
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.MY_EMAIL,
    subject: 'Meeting Cancelled',
    text: adminMailText,
  });
  return { success: true };
});
