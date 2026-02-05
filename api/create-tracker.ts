import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Missing Supabase configuration" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { name, pin } = req.body;

    if (!name || !pin) return res.status(400).json({ error: "Name and PIN required" });

    // Limit check
    const { count, error: countErr } = await supabase
      .from('trackers')
      .select('*', { count: 'exact', head: true })
      .eq('user_pin', pin);

    if (countErr) throw countErr;
    if (count !== null && count >= 5) {
      return res.status(400).json({ error: "Limit of 5 trackers reached" });
    }

    const { error: insertErr } = await supabase
      .from('trackers')
      .insert([{ name, user_pin: pin, balance: 0 }]);

    if (insertErr) throw insertErr;
    
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}