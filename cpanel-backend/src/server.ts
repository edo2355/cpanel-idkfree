import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { kycAdminRoutes } from './routes/kycAdmin.js';

dotenv.config();

const app = Fastify({ logger: true, trustProxy: true });

app.register(cors, { 
  origin: true, // Permite cualquier origen (ideal para producción abierta o testing) 
  credentials: true 
});
app.register(jwt, { secret: process.env.JWT_SECRET || 'super-secret-cpanel-key' });

app.get('/api/admin/ping', async () => ({ status: 'CPanel Backend funcionando' }));

app.post('/api/admin/login', async (req, reply) => {
  const { email, password } = req.body as any;
  if (!email || !password) return reply.code(400).send({ error: 'Email y contraseña requeridos' });

  try {
    const res = await db.execute({ sql: 'SELECT * FROM admins WHERE email = ?', args: [email] });
    const admin = res.rows[0];
    if (!admin) return reply.code(401).send({ error: 'Credenciales inválidas' });

    const isValid = await bcrypt.compare(password, admin.password_hash as string);
    if (!isValid) return reply.code(401).send({ error: 'Credenciales inválidas' });

    const accessToken = app.jwt.sign({ sub: admin.id, role: admin.role }, { expiresIn: '2h' });
    return reply.send({ accessToken, admin: { name: admin.name, role: admin.role } });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.get('/api/admin/stats', async (req, reply) => {
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

app.get('/api/admin/users', async (req, reply) => {
  try {
    const res = await db.execute(`
      SELECT id, alias, name, email, account_type, role, created_at,
      (SELECT COUNT(*) FROM posts WHERE author_id = users.id) as posts_count
      FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 50
    `);
    return reply.send({ users: res.rows });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.get('/api/admin/logs', async (req, reply) => {
  try {
    const res = await db.execute('SELECT * FROM device_logs ORDER BY created_at DESC LIMIT 100');
    return reply.send({ logs: res.rows });
  } catch (err) { return reply.code(500).send({ error: 'Error interno' }); }
});

app.get('/api/admin/telemetry', async (req, reply) => {
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

app.register(kycAdminRoutes);

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
