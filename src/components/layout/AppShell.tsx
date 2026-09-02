import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const AppShell: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#071424] text-[#d7e3fa] overflow-hidden">
      {/* Top Application Header */}
      <TopBar />

      {/* Main Workspace: Sidebar + Dynamic Route Outlet */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 relative flex flex-col overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Shell */}
      <MobileNav />
    </div>
  );
};
