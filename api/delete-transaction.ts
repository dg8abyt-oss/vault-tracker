import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { txId, trackerId, amount, type } = JSON.parse(req.body);

    // 1. Delete the Transaction
    const { error: delErr } = await db.from('transactions').delete().eq('id', txId);
    if (delErr) throw delErr;

    // 2. Revert the Balance
    // If we deleted an Income, we SUBTRACT from balance. If deleted Expense, we ADD to balance.
    const revertAmount = type === 'income' ? -Number(amount) : Number(amount);
    
    // RPC increment is safer, but direct update for simplicity here
    const { data: t } = await db.from('trackers').select('balance').eq('id', trackerId).single();
    const newBal = Number(t.balance) + revertAmount;
    
    await db.from('trackers').update({ balance: newBal }).eq('id', trackerId);

    return res.status(200).json({ success: true });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
}