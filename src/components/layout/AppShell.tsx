import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { OrcaBootSplash } from '@/components/ui/OrcaBootSplash';

export const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#F5F9FC] text-[#102B40] overflow-hidden">
      {/* Restrained Startup Splash Screen */}
      <OrcaBootSplash />

      {/* Top Application Header */}
      <TopBar />

      {/* Main Workspace: Sidebar + Dynamic Route Outlet */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 relative flex flex-col overflow-y-auto pb-20 md:pb-6 bg-[#F5F9FC]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Shell */}
      <MobileNav />
    </div>
  );
};
