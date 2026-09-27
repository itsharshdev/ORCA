import React from 'react';
import { useRole } from '@/hooks/useRole';
import { FishermanHomePage } from './fisherman/FishermanHomePage';
import { AuthorityDashboardPage } from './authority/AuthorityDashboardPage';
import { DisasterManagementPage } from './disaster/DisasterManagementPage';
import { ResearcherDashboardPage } from './researcher/ResearcherDashboardPage';
import { OperatorDashboardPage } from './operator/OperatorDashboardPage';

export const CommandCenterPage: React.FC = () => {
  const { activeRole } = useRole();

  switch (activeRole) {
    case 'COASTAL_AUTHORITY':
      return <AuthorityDashboardPage />;
    case 'DISASTER_MANAGER':
      return <DisasterManagementPage />;
    case 'RESEARCHER':
      return <ResearcherDashboardPage />;
    case 'MARITIME_OPERATOR':
      return <OperatorDashboardPage />;
    case 'FISHERMAN':
    default:
      return <FishermanHomePage />;
  }
};
