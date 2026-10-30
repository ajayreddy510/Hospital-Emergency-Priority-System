import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  LayoutDashboard,
  Activity,
  Users,
  AlertCircle,
  Stethoscope,
  ClipboardList,
  FileText,
  Search,
  ShieldCheck,
  Settings,
  LogOut,
  Radio,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const { isConnected } = useWebSocket();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { label: 'Emergency Queue', path: '/queue', icon: Activity, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'], badge: 'LIVE' },
    { label: 'New Intake', path: '/emergency/new', icon: AlertCircle, roles: ['ADMIN', 'NURSE', 'RECEPTIONIST'] },
    { label: 'Patients Directory', path: '/patients', icon: Users, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { label: 'Doctors Workload', path: '/doctors', icon: Stethoscope, roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { label: 'Clinical Treatments', path: '/treatments', icon: ClipboardList, roles: ['ADMIN', 'DOCTOR'] },
    { label: 'Reports & Analytics', path: '/reports', icon: FileText, roles: ['ADMIN', 'DOCTOR'] },
    { label: 'Global Search', path: '/search', icon: Search, roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    { label: 'Audit Trail', path: '/audit-logs', icon: ShieldCheck, roles: ['ADMIN'] },
    { label: 'System Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-30 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight">HEPS Command</h1>
            <p className="text-[10px] text-slate-400 font-mono">Emergency Priority v1.0</p>
          </div>
        </div>

        {/* Realtime WebSocket Status */}
        <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>WebSocket STOMP</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${isConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
            {isConnected ? 'ONLINE' : 'CONNECTING'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            if (!hasRole(item.roles as any)) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950 text-red-400 border border-red-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-semibold text-xs flex items-center justify-center shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
