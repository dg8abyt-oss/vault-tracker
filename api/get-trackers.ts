import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Missing Supabase Environment Variables" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { pin } = req.query;

    if (!pin) return res.status(400).json({ error: "PIN is required" });

    const { data, error } = await supabase
      .from('trackers')
      .select('*')
      .eq('user_pin', pin.toString())
      .limit(5);

    if (error) throw error;
    
    return res.status(200).json({ trackers: data || [] });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}