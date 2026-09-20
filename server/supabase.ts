import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

let adminClientInstance: SupabaseClient | null = null;

/**
 * Gets or initializes the server-side Supabase admin client.
 * Uses the secret/service-role key for privileged server-side operations.
 */
export const getSupabaseAdmin = (): SupabaseClient | null => {
  if (!config.SUPABASE_URL) {
    return null;
  }
  if (!adminClientInstance) {
    const keyToUse = config.secretKey || config.publishableKey;
    if (!keyToUse) {
      return null;
    }
    adminClientInstance = createClient(config.SUPABASE_URL, keyToUse, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminClientInstance;
};

/**
 * Creates a user-scoped Supabase client that forwards the caller's JWT token.
 * Queries executed with this client strictly enforce PostgreSQL Row-Level Security (RLS) policies.
 */
export const createScopedClient = (accessToken: string): SupabaseClient | null => {
  if (!config.SUPABASE_URL || !config.publishableKey) {
    return null;
  }
  return createClient(config.SUPABASE_URL, config.publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  displayName?: string;
}

/**
 * Verifies an access token using Supabase Auth.
 * Returns the authenticated user record or null if token is invalid.
 */
export const verifyAuthToken = async (accessToken: string): Promise<AuthenticatedUser | null> => {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return null;
  }

  try {
    const { data: { user }, error } = await admin.auth.getUser(accessToken);
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: (user.user_metadata?.role as string) || 'fisherman',
      displayName: (user.user_metadata?.display_name as string) || (user.email ? user.email.split('@')[0] : 'Fisherman'),
    };
  } catch {
    return null;
  }
};
