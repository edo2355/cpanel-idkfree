import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function requireOwner(req: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await req.jwtVerify() as any;
    if (payload.role !== 'owner') {
      return reply.code(403).send({ error: 'Solo el dueño puede realizar esta acción' });
    }
  } catch {
    return reply.code(401).send({ error: 'No autenticado' });
  }
}

export async function adminManagementRoutes(app: FastifyInstance) {
  // --- EQUIPO ---
  app.get('/api/admin/team', { preHandler: [requireOwner] }, async (req, reply) => {
    const res = await db.execute('SELECT id, name, email, role, is_active FROM admins ORDER BY created_at ASC');
    return reply.send({ team: res.rows });
  });

  app.post('/api/admin/team', { preHandler: [requireOwner] }, async (req, reply) => {
    const { name, email, password, role } = req.body as any;
    if (!name || !email || !password) return reply.code(400).send({ error: 'Faltan datos' });

    const existing = await db.execute({ sql: 'SELECT id FROM admins WHERE email = ?', args: [email] });
    if (existing.rows.length > 0) return reply.code(400).send({ error: 'Este correo ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    await db.execute({
      sql: 'INSERT INTO admins (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      args: [crypto.randomUUID(), name, email, hash, role || 'moderator']
    });
    return reply.send({ ok: true });
  });

  app.put('/api/admin/team/:id/toggle', { preHandler: [requireOwner] }, async (req, reply) => {
    const { id } = req.params as any;
    const res = await db.execute({ sql: 'SELECT is_active, role FROM admins WHERE id = ?', args: [id] });
    if (res.rows.length === 0) return reply.code(404).send({ error: 'Admin no encontrado' });
    if (res.rows[0].role === 'owner') return reply.code(400).send({ error: 'No puedes desactivar al dueño' });

    const newStatus = res.rows[0].is_active === 1 ? 0 : 1;
    await db.execute({ sql: 'UPDATE admins SET is_active = ? WHERE id = ?', args: [newStatus, id] });
    return reply.send({ ok: true });
  });

  // --- SETTINGS (API KEYS) ---
  app.get('/api/admin/settings', { preHandler: [requireOwner] }, async (req, reply) => {
    const res = await db.execute('SELECT key, value FROM app_settings');
    const settings: any = {};
    res.rows.forEach(r => { settings[r.key as string] = r.value; });
    return reply.send({ settings });
  });

  app.post('/api/admin/settings', { preHandler: [requireOwner] }, async (req, reply) => {
    const { key, value } = req.body as any;
    if (!key) return reply.code(400).send({ error: 'Key requerida' });
    
    await db.execute({
      sql: `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) 
            ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
      args: [key, value, value]
    });
    return reply.send({ ok: true });
  });
}
