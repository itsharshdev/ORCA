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
