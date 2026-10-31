import { FastifyInstance } from 'fastify';
import { db } from '../db.js';

export async function waitlistAdminRoutes(app: FastifyInstance) {
  // 1. Estadísticas generales (se puede llamar desde el Dashboard)
  app.get('/api/admin/waitlist/stats', async (req, reply) => {
    try {
      const total = await db.execute('SELECT COUNT(*) as c FROM waitlist');
      const early = await db.execute('SELECT COUNT(*) as c FROM waitlist WHERE is_early_access = 1');
      const refs = await db.execute('SELECT COUNT(*) as c FROM waitlist WHERE referred_by_code IS NOT NULL');
      
      return reply.send({
        total_waitlist: Number(total.rows[0]?.c || 0),
        early_access: Number(early.rows[0]?.c || 0),
        referrals: Number(refs.rows[0]?.c || 0),
      });
    } catch (err) {
      return reply.code(500).send({ error: 'Error obteniendo stats de waitlist' });
    }
  });

  // 2. Últimos registrados (para la tabla)
  app.get('/api/admin/waitlist/recent', async (req, reply) => {
    try {
      const res = await db.execute('SELECT alias, position, referral_code, is_early_access, created_at FROM waitlist ORDER BY created_at DESC LIMIT 10');
      return reply.send(res.rows);
    } catch (err) {
      return reply.code(500).send({ error: 'Error obteniendo registros recientes' });
    }
  });
}
