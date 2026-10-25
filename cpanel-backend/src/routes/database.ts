import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';

// Middleware estricto: solo el dueño puede usar esto
async function requireOwner(req: any, reply: any) {
  try {
    const payload = await req.jwtVerify();
    if (payload.role !== 'owner') {
      return reply.code(403).send({ error: 'Solo el dueño puede usar la consola SQL' });
    }
  } catch {
    return reply.code(401).send({ error: 'No autenticado' });
  }
}

export async function databaseRoutes(app: FastifyInstance) {
  app.post('/api/admin/db/query', { preHandler: [requireOwner] }, async (req, reply) => {
    const { query } = req.body as any;
    if (!query || typeof query !== 'string') return reply.code(400).send({ error: 'Query inválida' });

    // Bloqueo de comandos destructivos por seguridad
    const forbidden = ['DROP', 'TRUNCATE', 'ALTER', 'DELETE FROM users', 'DELETE FROM admins'];
    const upperQuery = query.toUpperCase();
    if (forbidden.some(f => upperQuery.includes(f))) {
      return reply.code(403).send({ error: 'Comando bloqueado por seguridad (DROP/TRUNCATE/ALTER/USER DELETE)' });
    }

    try {
      const start = Date.now();
      const res = await db.execute(query);
      const time = Date.now() - start;
      
      return reply.send({
        ok: true,
        rows: res.rows,
        rowCount: res.rowsAffected || res.rows.length,
        timeMs: time,
      });
    } catch (err: any) {
      return reply.code(400).send({ error: err.message });
    }
  });
}
