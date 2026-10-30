import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MedicalDisclaimerBanner } from '../components/ui/MedicalDisclaimerBanner';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MedicalDisclaimerBanner />
        <Topbar title={title} />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
