import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { name, pin } = req.body;
  const { count } = await supabase.from('trackers').select('*', { count: 'exact', head: true }).eq('user_pin', pin);
  
  if (count && count >= 5) return res.status(400).json({ error: "Limit reached" });
  
  const { error } = await supabase.from('trackers').insert([{ name, user_pin: pin, balance: 0 }]);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}