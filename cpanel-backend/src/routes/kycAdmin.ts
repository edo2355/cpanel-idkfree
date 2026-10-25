import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db.js';
import { requireRole } from '../middleware/roles.js';

// Middleware de seguridad
async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: 'No autenticado' });
  }
}

export async function kycAdminRoutes(app: FastifyInstance) {
  // 1. Listar solicitudes pendientes
  app.get('/api/admin/kyc/pending', { preHandler: [requireRole(['owner', 'admin', 'kyc_manager'])] }, async (req, reply) => {
    try {
      const res = await db.execute(`
        SELECT k.user_id, k.document_type, k.document_number,
               k.document_photo, k.selfie_photo, k.status, k.admin_notes,
               k.submitted_at, u.alias, u.name
        FROM kyc_verifications k
        LEFT JOIN users u ON u.id = k.user_id
        WHERE k.status = 'pending'
        ORDER BY k.submitted_at ASC
      `);
      return reply.send({ verifications: res.rows });
    } catch (err) {
      app.log.error({ err }, 'Error en kyc/pending');
      return reply.code(500).send({ error: 'Error interno' });
    }
  });

  // 2. Aprobar o rechazar
  app.post('/api/admin/kyc/:user_id/review', { preHandler: [requireRole(['owner', 'admin', 'kyc_manager'])] }, async (req, reply) => {
    const { user_id } = req.params as any;
    const { action, notes } = req.body as any;

    if (!['approve', 'reject'].includes(action)) {
      return reply.code(400).send({ error: 'action debe ser approve o reject' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    try {
      const existing = await db.execute({
        sql: 'SELECT user_id FROM kyc_verifications WHERE user_id = ?',
        args: [user_id],
      });
      if (existing.rows.length === 0) {
        return reply.code(404).send({ error: 'Solicitud KYC no encontrada' });
      }

      await db.execute({
        sql: `UPDATE kyc_verifications
              SET status = ?, admin_notes = ?, reviewed_at = CURRENT_TIMESTAMP
              WHERE user_id = ?`,
        args: [newStatus, notes || null, user_id],
      });

      return reply.send({ ok: true, status: newStatus });
    } catch (err) {
      app.log.error({ err }, 'Error en kyc/review');
      return reply.code(500).send({ error: 'Error interno' });
    }
  });
}
