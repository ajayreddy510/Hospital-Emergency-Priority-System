import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  Layers,
  Sparkles,
  Stethoscope,
  BarChart3,
  Radio,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 px-8 py-4 flex items-center justify-between backdrop-blur-md bg-slate-950/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-bold text-base text-slate-100 tracking-tight">HOSPITAL EMERGENCY</span>
            <span className="text-xs block text-cyan-400 font-mono font-medium">PRIORITY MANAGEMENT SYSTEM</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors">
            Sign In
          </Link>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-950/50"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time Emergency Triage & Hospital Queue Management</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto">
          Administrative Hospital Emergency Priority Queue & Operations System
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          High-performance full-stack triage system driven by Java 21 Min-Heap Priority Queue algorithms, real-time STOMP WebSockets, Spring Data MongoDB Atlas, and React command center UI.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-xl shadow-cyan-950/50"
          >
            <span>Explore Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/queue')}
            className="bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 px-6 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>View Emergency Queue</span>
          </button>
        </div>

        {/* Safety Banner */}
        <div className="mt-12 bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 max-w-3xl mx-auto text-xs text-amber-200/90 text-left flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 block mb-0.5">Medical Triage Administrative Scope Notice</strong>
            <span>This application is designed strictly for administrative emergency queue prioritization and educational demonstration. It does not provide automated clinical diagnosis. Authorized medical personnel maintain complete control to review and manually override priority levels at any time with full audit logging.</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-6 py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-100">Core Technical Modules</h2>
            <p className="text-xs text-slate-400 mt-2">Built with enterprise full-stack standards and explicit DSA heap data structures.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 w-fit">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Min-Heap Priority Queue (DSA)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Core algorithm sorts cases by emergency weight score and arrival timestamp tie-breaking in O(log N) complexity.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
              <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 w-fit">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">STOMP WebSockets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant queue sync broadcasts intake events, priority overrides, and doctor assignments to all connected command dashboards.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel glass-panel-hover space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 w-fit">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Doctor Workload Allocation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated matching service recommends available physicians based on department specialization and current active case workload.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Showcase */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-100">System Architecture Breakdown</h2>
          <p className="text-xs text-slate-400 mt-2">End-to-end integration flow from React SPA to Spring Boot 3 & MongoDB Atlas.</p>
        </div>

        <div className="p-8 rounded-2xl glass-panel border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-cyan-400 block mb-1">FRONTEND LAYER</span>
              <h4 className="font-bold text-sm text-slate-200">React 18 + TS</h4>
              <p className="text-[11px] text-slate-400 mt-1">Vite, Tailwind, Recharts, TanStack Query</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-emerald-400 block mb-1">BACKEND API</span>
              <h4 className="font-bold text-sm text-slate-200">Spring Boot 3</h4>
              <p className="text-[11px] text-slate-400 mt-1">Java 21, Spring Security JWT, STOMP</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-amber-400 block mb-1">DSA ENGINE</span>
              <h4 className="font-bold text-sm text-slate-200">PriorityQueue Heap</h4>
              <p className="text-[11px] text-slate-400 mt-1">Custom Comparator, Score & Timestamp</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-purple-400 block mb-1">DATABASE</span>
              <h4 className="font-bold text-sm text-slate-200">MongoDB Atlas</h4>
              <p className="text-[11px] text-slate-400 mt-1">Multi-field indexes & Spring Data Mongo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 px-8 py-6 text-center text-xs text-slate-500">
        <p>Hospital Emergency Priority System • Java 21 Spring Boot & React Full-Stack Portfolio Project</p>
      </footer>
    </div>
  );
};
