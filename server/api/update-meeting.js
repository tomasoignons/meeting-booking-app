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
  const { id, date, time, duration_minutes, location, notes } = body;
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
    console.error('Meeting not found or fetch error:', fetchError);
    return { error: 'Meeting not found' };
  }
  // Update Google Calendar event
  const start_time = new Date(`${date}T${time}:00`);
  const end_time = new Date(start_time.getTime() + duration_minutes * 60000);
  const pad = n => n.toString().padStart(2, '0');
  const tz = '+02:00';
  const startDateTime = `${start_time.getFullYear()}-${pad(start_time.getMonth() + 1)}-${pad(start_time.getDate())}T${pad(start_time.getHours())}:${pad(start_time.getMinutes())}:${pad(start_time.getSeconds())}${tz}`;
  const endDateTime = `${end_time.getFullYear()}-${pad(end_time.getMonth() + 1)}-${pad(end_time.getDate())}T${pad(end_time.getHours())}:${pad(end_time.getMinutes())}:${pad(end_time.getSeconds())}${tz}`;
  try {
    const accessToken = await getAccessToken();
    await axios.patch(
      `https://www.googleapis.com/calendar/v3/calendars/${process.env.CALENDAR_ID}/events/${meeting.google_calendar_event_id}`,
      {
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        description: notes,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (err) {
    console.error('Failed to update Google Calendar event:', err.response?.data || err.message);
    return { error: 'Failed to update Google Calendar event' };
  }
  // Combine date and time for start_time
  const new_start_time = new Date(`${date}T${time}:00`);
  const new_end_time = new Date(new_start_time.getTime() + duration_minutes * 60000);
  // --- LOGGING BEFORE UPDATE ---
  console.log('Updating meeting in Supabase:', {
    id,
    start_time: new_start_time.toISOString(),
    end_time: new_end_time.toISOString(),
    duration_minutes,
    location,
    notes,
  });
  // --- TIMEOUT WRAPPER ---
  function timeoutPromise(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase update timed out')), ms))
    ]);
  }
  let updateResult;
  try {
    updateResult = await timeoutPromise(
      supabase
        .from('meetings')
        .update({
          start_time: new_start_time.toISOString(),
          end_time: new_end_time.toISOString(),
          duration_minutes,
        })
        .eq('id', id),
      5000 // 5 seconds
    );
  } catch (err) {
    console.error('Supabase update error or timeout:', err);
    return { error: 'Supabase update failed or timed out' };
  }
  const { error, data } = updateResult;
  console.log('Supabase update result:', { error, data });
  if (error) {
    return { error: error.message };
  }
  // Send notification emails
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const userMailText = `Your meeting has been updated!\nDate: ${date}\nTime: ${time}\nDuration: ${duration_minutes} minutes\n${location ? `Location: ${location}` : ''}\n${notes ? `Notes: ${notes}` : ''}`;
    const adminMailText = `Meeting updated by ${meeting.booker_name} (${meeting.booker_email})\nDate: ${date}\nTime: ${time}\nDuration: ${duration_minutes} minutes\nLocation: ${location}\n${notes ? `Notes: ${notes}` : ''}`;
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: meeting.booker_email,
      subject: 'Your Meeting Has Been Updated',
      text: userMailText,
    });
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MY_EMAIL,
      subject: 'Meeting Updated',
      text: adminMailText,
    });
    console.log('Notification emails sent');
  } catch (err) {
    console.error('Failed to send notification emails:', err);
    return { error: 'Failed to send notification emails: ' + err.message };
  }
  return { success: true };
});
