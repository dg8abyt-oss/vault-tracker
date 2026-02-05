import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { pin } = req.query;
  const { data, error } = await supabase.from('trackers').select('*').eq('user_pin', pin).limit(5);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ trackers: data || [] });
}