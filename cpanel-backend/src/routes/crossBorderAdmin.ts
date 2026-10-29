import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { requireRole } from '../middleware/roles.js';

export async function crossBorderAdminRoutes(app: FastifyInstance) {
  // Listar suppliers pendientes
  app.get('/api/admin/cross-border/suppliers/pending', { preHandler: [requireRole(['owner', 'admin', 'kyc_manager'])] }, async (_req, reply) => {
    try {
      const res = await db.execute(`
        SELECT id, user_id, company_name, country_code, categories,
               min_order_value, currency, contact_whatsapp, contact_email,
               contact_wechat, website, created_at
        FROM supplier_profiles
        WHERE verified_at IS NULL
        ORDER BY created_at ASC
        LIMIT 100
      `);
      return reply.send({ pending: res.rows });
    } catch (err) {
      app.log.error({ err }, 'Error en cross-border/suppliers/pending');
      return reply.code(500).send({ error: 'Error interno' });
    }
  });

  // Verificar supplier
  app.post('/api/admin/cross-border/suppliers/:id/verify', { preHandler: [requireRole(['owner', 'admin', 'kyc_manager'])] }, async (req, reply) => {
    const { id } = req.params as any;
    const adminId = (req.user as any).sub;
    try {
      const r = await db.execute({
        sql: `UPDATE supplier_profiles
              SET verified_at = datetime('now'), verified_by = ?
              WHERE id = ? AND verified_at IS NULL`,
        args: [adminId, id],
      });
      if (r.rowsAffected === 0) return reply.code(404).send({ error: 'Supplier no encontrado o ya verificado' });

      const upd = await db.execute({ sql: 'SELECT id, company_name, verified_at FROM supplier_profiles WHERE id = ?', args: [id] });
      return reply.send({ supplier: upd.rows[0] });
    } catch (err) {
      app.log.error({ err }, 'Error en cross-border/verify');
      return reply.code(500).send({ error: 'Error interno' });
    }
  });

  // Listar influencers pendientes
  app.get('/api/admin/cross-border/influencers/pending', { preHandler: [requireRole(['owner', 'admin', 'kyc_manager'])] }, async (_req, reply) => {
    try {
      const res = await db.execute(`
        SELECT id, user_id, niche, platforms, followers_count,
               rate_per_post, rate_per_live, currency, country_code, created_at
        FROM influencer_profiles
        WHERE verified_at IS NULL
        ORDER BY created_at ASC
        LIMIT 100
      `);
      return reply.send({ pending: res.rows });
    } catch (err) {
      app.log.error({ err }, 'Error en cross-border/influencers/pending');
      return reply.code(500).send({ error: 'Error interno' });
    }
  });

  // Verificar influencer
  app.post('/api/admin/cross-border/influencers/:id/verify', { preHandler: [requireRole(['owner', 'admin', 'kyc_manager'])] }, async (req, reply) => {
    const { id } = req.params as any;
    const adminId = (req.user as any).sub;
    try {
      const r = await db.execute({
        sql: `UPDATE influencer_profiles
              SET verified_at = datetime('now'), verified_by = ?
              WHERE id = ? AND verified_at IS NULL`,
        args: [adminId, id],
      });
      if (r.rowsAffected === 0) return reply.code(404).send({ error: 'Influencer no encontrado o ya verificado' });

      const upd = await db.execute({ sql: 'SELECT id, niche, followers_count, verified_at FROM influencer_profiles WHERE id = ?', args: [id] });
      return reply.send({ influencer: upd.rows[0] });
    } catch (err) {
      app.log.error({ err }, 'Error en cross-border/influencers/verify');
      return reply.code(500).send({ error: 'Error interno' });
    }
  });
}
