import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Activity, KeyRound, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Authentication successful! Welcome to HEPS Command Center.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-xl shadow-cyan-950/50 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">HEPS Staff Access</h2>
          <p className="text-xs text-slate-400">Hospital Emergency Priority System Command Center</p>
        </div>

        {/* Login Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Hospital Staff Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hospital.org"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Command Center'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Credentials */}
          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">Quick Demo User Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@hospital.org', 'Admin123!')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-left text-[11px] transition-colors"
              >
                <span className="font-semibold text-cyan-400 block">Admin</span>
                <span className="text-slate-500 text-[10px]">admin@hospital.org</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('doctor.smith@hospital.org', 'Doctor123!')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left text-[11px] transition-colors"
              >
                <span className="font-semibold text-emerald-400 block">Doctor</span>
                <span className="text-slate-500 text-[10px]">doctor.smith@hospital.org</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('nurse.joy@hospital.org', 'Nurse123!')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left text-[11px] transition-colors"
              >
                <span className="font-semibold text-amber-400 block">Nurse</span>
                <span className="text-slate-500 text-[10px]">nurse.joy@hospital.org</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('receptionist@hospital.org', 'Recept123!')}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-left text-[11px] transition-colors"
              >
                <span className="font-semibold text-blue-400 block">Receptionist</span>
                <span className="text-slate-500 text-[10px]">receptionist@hospital.org</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Need a new staff account?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
