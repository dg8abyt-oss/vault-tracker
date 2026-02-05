import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const { tracker_id, amount, type, note } = JSON.parse(req.body);

      // 1. Log Transaction
      const { error: txErr } = await db.from('transactions').insert([{ tracker_id, amount, type, note }]);
      if (txErr) throw txErr;

      // 2. Update Balance (RPC fallback to direct update)
      const { data: t } = await db.from('trackers').select('balance').eq('id', tracker_id).single();
      const newBal = type === 'income' ? Number(t.balance) + Number(amount) : Number(t.balance) - Number(amount);
      
      const { error: upErr } = await db.from('trackers').update({ balance: newBal }).eq('id', tracker_id);
      if (upErr) throw upErr;

      return res.status(200).json({ success: true });
    }
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}