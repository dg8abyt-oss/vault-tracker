import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { txId, trackerId, amount, type } = JSON.parse(req.body);

    const { error } = await db.from('transactions').delete().eq('id', txId);
    if (error) throw error;

    // Revert Balance
    const revertAmt = type === 'income' ? -Number(amount) : Number(amount);
    const { data: t } = await db.from('trackers').select('balance').eq('id', trackerId).single();
    await db.from('trackers').update({ balance: Number(t.balance) + revertAmt }).eq('id', trackerId);

    return res.status(200).json({ success: true });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
}