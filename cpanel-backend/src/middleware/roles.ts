import { FastifyRequest, FastifyReply } from 'fastify';

export function requireRole(allowedRoles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = await req.jwtVerify() as any;
      if (!allowedRoles.includes(payload.role)) {
        return reply.code(403).send({ error: 'No tienes permisos para esta sección' });
      }
    } catch {
      return reply.code(401).send({ error: 'No autenticado' });
    }
  };
}
