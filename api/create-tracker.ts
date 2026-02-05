import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, pin } = JSON.parse(req.body);
    const { count } = await db.from('trackers').select('*', { count: 'exact', head: true }).eq('user_pin', pin);
    
    if (count && count >= 5) return res.status(400).json({ error: "Limit Reached" });
    
    await db.from('trackers').insert([{ name, user_pin: pin, balance: 0 }]);
    return res.status(200).json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}