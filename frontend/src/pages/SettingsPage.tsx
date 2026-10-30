import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Settings, Shield, Sliders, Database, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>System Settings & Triage Configurations</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure emergency queue priority weights, doctor allocation rules, and profile preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Priority Queue Algorithm Settings Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Min-Heap Priority Score Weights</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-red-500/30">
              <span className="text-red-400 font-bold block mb-1">CRITICAL</span>
              <span className="font-mono text-slate-200 text-base font-bold">100 Pts</span>
              <p className="text-[10px] text-slate-500 mt-1">Immediate intervention</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30">
              <span className="text-amber-400 font-bold block mb-1">HIGH</span>
              <span className="font-mono text-slate-200 text-base font-bold">75 Pts</span>
              <p className="text-[10px] text-slate-500 mt-1">Urgent care &lt; 30m</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/30">
              <span className="text-emerald-400 font-bold block mb-1">MEDIUM</span>
              <span className="font-mono text-slate-200 text-base font-bold">50 Pts</span>
              <p className="text-[10px] text-slate-500 mt-1">Semi-urgent condition</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-blue-500/30">
              <span className="text-blue-400 font-bold block mb-1">LOW</span>
              <span className="font-mono text-slate-200 text-base font-bold">25 Pts</span>
              <p className="text-[10px] text-slate-500 mt-1">Non-urgent administrative</p>
            </div>
          </div>
        </div>

        {/* User Account & Security Settings */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>User Security & Role Access</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <p><strong className="text-slate-100">Authenticated User:</strong> {user?.name}</p>
            <p><strong className="text-slate-100">Registered Email:</strong> {user?.email}</p>
            <p><strong className="text-slate-100">Assigned Role:</strong> <span className="font-mono text-cyan-400 uppercase font-semibold">{user?.role}</span></p>
            <p><strong className="text-slate-100">Authentication Protocol:</strong> Spring Security 6 + JWT BCrypt 256-bit Token</p>
          </div>
        </div>

        {/* Database & Environment info */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Database & Cloud Architecture</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <p><strong className="text-slate-100">Database Engine:</strong> MongoDB Atlas (Cloud Cluster)</p>
            <p><strong className="text-slate-100">Real-Time Messaging:</strong> Spring STOMP WebSocket (/topic/queue-updates)</p>
            <p><strong className="text-slate-100">Backend Host:</strong> Render (Spring Boot 3 Java 21)</p>
            <p><strong className="text-slate-100">Frontend Host:</strong> Vercel (React 18 + Vite SPA)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
