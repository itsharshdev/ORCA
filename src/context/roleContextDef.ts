import { createContext } from 'react';
import type { UserRole } from '@/types/contract';
import type { RoleConfig } from '@/config/roles';

export interface RoleContextType {
  activeRole: UserRole;
  roleConfig: RoleConfig;
  setRole: (role: UserRole) => void;
  isDevPreview: boolean;
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined);
