import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { tracker_id } = req.query;
      const { data } = await db.from('transactions').select('*').eq('tracker_id', tracker_id).order('created_at', { ascending: false }).limit(50);
      return res.status(200).json({ history: data || [] });
    }

    if (req.method === 'POST') {
      const { tracker_id, amount, type, note, category } = JSON.parse(req.body);

      const { error: txErr } = await db.from('transactions').insert([{ tracker_id, amount, type, note, category }]);
      if (txErr) throw txErr;

      const { data: t, error: fErr } = await db.from('trackers').select('balance').eq('id', tracker_id).single();
      if(fErr || !t) throw new Error("Tracker not found");

      const newBal = type === 'income' ? Number(t.balance) + Number(amount) : Number(t.balance) - Number(amount);
      await db.from('trackers').update({ balance: newBal }).eq('id', tracker_id);

      return res.status(200).json({ success: true });
    }
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
}