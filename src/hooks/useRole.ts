import { useContext } from 'react';
import { RoleContext, type RoleContextType } from '@/context/roleContextDef';

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
