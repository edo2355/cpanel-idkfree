import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { kycAdminRoutes } from './routes/kycAdmin.js';

dotenv.config();

const app = Fastify({ logger: true, trustProxy: true });

async function requireAdmin(req: any, reply: any) {
  try { await req.jwtVerify(); } catch { return reply.code(401).send({ error: 'No autenticado' }); }
}

app.register(cors, { 
  origin: ['https://cpanel-idkfree-web.onrender.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // 🛡️ Solo tu Cpanel y local 
  credentials: true 
});
// 🛡️ CABECERAS DE SEGURIDAD
  app.register(helmet, { contentSecurityPolicy: false });
  
    app.register(jwt, { secret: process.env.JWT_SECRET || 'super-secret-cpanel-key' });

app.get('/api/admin/ping', async () => ({ status: 'CPanel Backend funcionando' }));

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

async function rateLimitLogin(req: any, reply: any) {
  const email = req.body?.email || req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxAttempts = 5;

  const record = loginAttempts.get(email);
  if (record && record.resetAt > now) {
    if (record.count >= maxAttempts) {
      return reply.code(429).send({ error: 'Demasiados intentos fallidos para este correo. Espera 1 minuto.' });
    }
    record.count++;
  } else {
    loginAttempts.set(email, { count: 1, resetAt: now + windowMs });
  }
}

app.post('/api/admin/login', { preHandler: rateLimitLogin }, async (req, reply) => {
  const { email, password } = req.body as any;
  if (!email || !password) return reply.code(400).send({ error: 'Email y contraseña requeridos' });

  try {
    const res = await db.execute({ sql: 'SELECT * FROM admins WHERE email = ?', args: [email] });
    const admin = res.rows[0];
    if (!admin) return reply.code(401).send({ error: 'Credenciales inválidas' });

    const isValid = await bcrypt.compare(password, admin.password_hash as string);
    if (!isValid) { await saveLogToDB('LOGIN_FAILED', `Intento de login fallido para ${email}`); return reply.code(401).send({ error: 'Credenciales inválidas' }); }

    const accessToken = app.jwt.sign({ sub: admin.id, role: admin.role }, { expiresIn: '2h' });
    return reply.send({ accessToken, admin: { name: admin.name, role: admin.role } });
  } catch (err: any) { console.error('ERROR REAL LOGIN:', err); return reply.code(500).send({ error: 'Error interno', details: err?.message || String(err) }); }
});

app.put('/api/admin/password', { preHandler: [requireAdmin] }, async (req, reply) => {
  const { currentPassword, newPassword } = req.body as any;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return reply.code(400).send({ error: 'Datos inválidos. La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const adminId = (req.user as any).sub;
    const res = await db.execute({ sql: 'SELECT password_hash FROM admins WHERE id = ?', args: [adminId] });
    const admin = res.rows[0];
    
    if (!admin) return reply.code(404).send({ error: 'Admin no encontrado' });

    const isValid = await bcrypt.compare(currentPassword, admin.password_hash as string);
    if (!isValid) return reply.code(401).send({ error: 'La contraseña actual es incorrecta' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.execute({ sql: 'UPDATE admins SET password_hash = ? WHERE id = ?', args: [newHash, adminId] });

    return reply.send({ ok: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    app.log.error({ err }, 'Error al cambiar contraseña');
    return reply.code(500).send({ error: 'Error interno' });
  }
});

app.get('/api/admin/stats', { preHandler: [requireAdmin] }, async (req, reply) => {
  try {
    const users = await db.execute('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
    const posts = await db.execute('SELECT COUNT(*) as count FROM posts WHERE deleted_at IS NULL');
    const messages = await db.execute('SELECT COUNT(*) as count FROM direct_messages');
    return reply.send({
      total_users: Number(users.rows[0]?.count || 0),
      total_posts: Number(posts.rows[0]?.count || 0),
      total_messages: Number(messages.rows[0]?.count || 0),
    });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.get('/api/admin/users', { preHandler: [requireAdmin] }, async (req, reply) => {
  try {
    const type = (req.query as any).type || 'real';
    const condition = type === 'test' ? 'is_test = 1' : 'is_test = 0';
    
    const res = await db.execute(`
      SELECT id, alias, name, email, account_type, role, created_at, is_test,
             (SELECT COUNT(*) FROM posts WHERE author_id = users.id) as posts_count
      FROM users WHERE deleted_at IS NULL AND ${condition} ORDER BY created_at DESC LIMIT 50
    `);
    return reply.send({ users: res.rows });
  } catch (err) {
    return reply.code(500).send({ error: 'Error interno' });
  }
});

app.get('/api/admin/logs', async (req, reply) => {
  try {
    const res = await db.execute('SELECT * FROM device_logs ORDER BY created_at DESC LIMIT 100');
    return reply.send({ logs: res.rows });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.get('/api/admin/telemetry', { preHandler: [requireAdmin] }, async (req, reply) => {
  try {
    const res = await db.execute('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100');
    return reply.send({ logs: res.rows });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.get('/api/admin/reports', async (req, reply) => {
  try {
    const res = await db.execute('SELECT * FROM reports ORDER BY created_at DESC LIMIT 50');
    return reply.send({ reports: res.rows });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.post('/api/admin/reports/:id/resolve', async (req, reply) => {
  const { id } = req.params as any;
  try {
    await db.execute({ sql: "UPDATE reports SET status = 'resolved' WHERE id = ?", args: [id] });
    return reply.send({ ok: true });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.setErrorHandler(async (error: any, request, reply) => {
  app.log.error(error);
  await saveLogToDB('ERROR_SERVER', error.message, { url: request.url, method: request.method, stack: error.stack });
  reply.status(500).send({ error: 'Error interno del servidor', details: error.message });
});

app.register(kycAdminRoutes);

console.log('TURSO URL:', process.env.TURSO_DATABASE_URL);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);

import crypto from 'crypto';

async function saveLogToDB(event_type: string, message: string, details: any = null) {
  try {
    await db.execute({
      sql: 'INSERT INTO system_logs (id, event_type, message, details) VALUES (?, ?, ?, ?)',
      args: [crypto.randomUUID(), event_type, message, details ? JSON.stringify(details) : null]
    });
  } catch (e) {
    console.error('No se pudo guardar el log en DB:', e);
  }
}

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    console.log('🛡️ CPanel Backend aislado corriendo en el puerto 3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
