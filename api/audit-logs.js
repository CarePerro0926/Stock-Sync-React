/* eslint-env node */
// api/audit-logs.js
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function verifyToken(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('No token');
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const payload = verifyToken(req);
    if (!payload || !Array.isArray(payload.roles) || !payload.roles.includes('auditor')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { usuario, accion, desde, hasta, limit = 100, offset = 0 } = req.query;
    const maxLimit = Math.min(Number(limit) || 100, 1000);
    const from = Number(offset) || 0;

    let q = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + maxLimit - 1);

    if (usuario) q = q.eq('actor_username', usuario);
    if (accion) q = q.eq('action', accion);
    if (desde) q = q.gte('created_at', desde);
    if (hasta) q = q.lte('created_at', hasta);

    const { data, error, count } = await q;
    if (error) return res.status(500).json({ error: error.message });

    return res.json({ items: data || [], meta: { total: count ?? (data || []).length } });
  } catch (err) {
    const message = err?.message || String(err);
    const status = message.includes('No token') || message.toLowerCase().includes('jwt') ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
