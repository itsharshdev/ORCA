import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAuthToken, type AuthenticatedUser } from '../supabase.js';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
    accessToken: string | null;
  }
}

/**
 * Extracts Bearer token from the incoming request Authorization header.
 */
export const extractBearerToken = (request: FastifyRequest): string | null => {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }
  return null;
};

/**
 * Hook for optional authentication: populates request.user if valid token provided.
 */
export const optionalAuth = async (request: FastifyRequest): Promise<void> => {
  const token = extractBearerToken(request);
  if (!token) {
    request.user = null;
    request.accessToken = null;
    return;
  }

  const user = await verifyAuthToken(token);
  request.user = user;
  request.accessToken = token;
};

/**
 * PreHandler hook for protected routes. Rejects unauthenticated requests with HTTP 401.
 */
export const requireAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const token = extractBearerToken(request);
  if (!token) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required to access this resource.',
      },
    });
  }

  const user = await verifyAuthToken(token);
  if (!user) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired authentication token.',
      },
    });
  }

  request.user = user;
  request.accessToken = token;
};

/**
 * PreHandler hook enforcing server-side Role-Based Access Control (RBAC).
 * Enforces that caller holds one of the specified operational roles.
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // If not already authenticated via requireAuth, execute authentication first
    if (!request.user) {
      await requireAuth(request, reply);
      if (reply.sent) return;
    }

    const user = request.user;
    if (!user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required to perform this operation.',
          details: null,
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Role resolution: user.role > header x-orca-role > default FISHERMAN
    const roleFromHeader = (request.headers['x-orca-role'] as string | undefined)?.toUpperCase();
    const userRole = (user.role || roleFromHeader || 'FISHERMAN').toUpperCase();

    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    const isAuthorized =
      normalizedAllowed.includes(userRole) ||
      userRole === 'ADMIN' ||
      userRole === 'SERVICE_ROLE';

    if (!isAuthorized) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: `Role '${userRole}' is not authorized to perform this operation. Allowed roles: ${allowedRoles.join(', ')}.`,
          details: {
            userRole,
            requiredRoles: allowedRoles,
          },
          requestId: request.id,
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};
