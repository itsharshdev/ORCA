import { useContext } from 'react';
import { OrchestrationContext } from '@/context/orchestrationContextDef';

export const useOrchestration = () => {
  const context = useContext(OrchestrationContext);
  if (!context) {
    throw new Error('useOrchestration must be used within an OrchestrationProvider');
  }
  return context;
};
