import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types/contract';
import { ROLE_CONFIGS } from '@/config/roles';
import { RoleContext } from './roleContextDef';

const ROLE_STORAGE_KEY = 'orca_active_user_role';

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY);
      if (saved && saved in ROLE_CONFIGS) {
        return saved as UserRole;
      }
    }
    return 'FISHERMAN';
  });

  const setRole = (role: UserRole) => {
    setActiveRoleState(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ROLE_STORAGE_KEY, activeRole);
    }
  }, [activeRole]);

  const roleConfig = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS.FISHERMAN;

  return (
    <RoleContext.Provider
      value={{
        activeRole,
        roleConfig,
        setRole,
        isDevPreview: true,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};
