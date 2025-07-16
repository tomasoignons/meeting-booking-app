import { defineEventHandler, getQuery } from 'h3';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'meetings' } }
);

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id) {
    return { error: 'Missing meeting id' };
  }
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    return { error: error.message };
  }
  return data;
});
