import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Search, Bell, Shield, PlusCircle } from 'lucide-react';

interface TopbarProps {
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title = 'Operations Command Center' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-14 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-sm text-slate-100 tracking-tight">{title}</h2>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Patient ID, Name, Case ID..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </form>

      {/* Quick Action & User Pill */}
      <div className="flex items-center gap-3">
        {user?.role !== 'DOCTOR' && (
          <>
            <button
              onClick={() => navigate('/emergency/new')}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Emergency Intake</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
          </>
        )}

        <div className="flex items-center gap-2">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
            <span className="text-[10px] font-mono text-slate-400">{user?.role}</span>
          </div>
          <div className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
