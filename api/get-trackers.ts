import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { pin } = req.query;
    if (!pin) return res.status(400).json({ error: "No PIN" });

    const { data, error } = await db.from('trackers').select('*').eq('user_pin', pin).limit(20);
    if (error) throw error;
    
    return res.status(200).json({ trackers: data || [] });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
}