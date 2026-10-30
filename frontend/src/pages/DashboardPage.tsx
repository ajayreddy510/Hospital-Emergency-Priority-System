import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/ui/StatCard';
import { EmergencyBadge } from '../components/ui/EmergencyBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Users,
  AlertTriangle,
  AlertCircle,
  Stethoscope,
  Clock,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'RECEPTIONIST';
  const roleDashboard = {
    ADMIN: {
      eyebrow: 'Hospital Operations Command Center',
      title: 'Operations Overview',
      description: 'Monitor hospital activity, staffing, and emergency response across all departments.',
      action: 'Review Emergency Queue',
      actionPath: '/queue',
    },
    DOCTOR: {
      eyebrow: 'Clinical Worklist',
      title: 'Your Emergency Worklist',
      description: 'Review prioritized cases, manage active treatment, and follow clinical outcomes.',
      action: 'Open Patient Queue',
      actionPath: '/queue',
    },
    NURSE: {
      eyebrow: 'Triage & Intake Station',
      title: 'Triage and Patient Intake',
      description: 'Register emergency arrivals, review priority levels, and coordinate doctor assignment.',
      action: 'Start Emergency Intake',
      actionPath: '/emergency/new',
    },
    RECEPTIONIST: {
      eyebrow: 'Admissions Desk',
      title: 'Patient Admissions',
      description: 'Register patients, begin emergency intake, and check the live waiting queue.',
      action: 'Register New Patient',
      actionPath: '/patient-register',
    },
  }[role];
  const showAnalytics = role === 'ADMIN' || role === 'DOCTOR';
  const showDoctorWorkload = role !== 'RECEPTIONIST';

  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getSummary,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-900 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton rows={3} />
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <p className="text-red-400 font-semibold text-sm">Unable to connect to hospital backend API.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-cyan-600 text-slate-950 rounded-lg text-xs font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards = role === 'ADMIN'
    ? [
        { title: 'Total Patients', value: summary.totalPatients, icon: Users, variant: 'default' as const },
        { title: 'Active Emergency', value: summary.activeEmergencyCases, icon: AlertTriangle, variant: 'high' as const },
        { title: 'Critical Cases', value: summary.criticalCasesCount, icon: AlertCircle, variant: 'critical' as const },
        { title: 'Available Doctors', value: summary.availableDoctorsCount, icon: Stethoscope, variant: 'emerald' as const },
        { title: 'Avg Wait Time', value: `${summary.averageWaitTimeMinutes}m`, icon: Clock, variant: 'cyan' as const },
        { title: 'Completed Today', value: summary.completedCasesToday, icon: CheckCircle2, variant: 'default' as const },
      ]
    : role === 'DOCTOR'
      ? [
          { title: 'Active Cases', value: summary.activeEmergencyCases, icon: Activity, variant: 'high' as const },
          { title: 'Critical Cases', value: summary.criticalCasesCount, icon: AlertCircle, variant: 'critical' as const },
          { title: 'Completed Today', value: summary.completedCasesToday, icon: CheckCircle2, variant: 'emerald' as const },
          { title: 'Avg Wait Time', value: `${summary.averageWaitTimeMinutes}m`, icon: Clock, variant: 'cyan' as const },
        ]
      : role === 'NURSE'
        ? [
            { title: 'Waiting Patients', value: summary.waitingPatientsCount, icon: Users, variant: 'default' as const },
            { title: 'Critical Cases', value: summary.criticalCasesCount, icon: AlertCircle, variant: 'critical' as const },
            { title: 'Active Emergency', value: summary.activeEmergencyCases, icon: AlertTriangle, variant: 'high' as const },
            { title: 'Avg Wait Time', value: `${summary.averageWaitTimeMinutes}m`, icon: Clock, variant: 'cyan' as const },
          ]
        : [
            { title: 'Registered Patients', value: summary.totalPatients, icon: Users, variant: 'default' as const },
            { title: 'Waiting Patients', value: summary.waitingPatientsCount, icon: Clock, variant: 'cyan' as const },
            { title: 'Active Emergency', value: summary.activeEmergencyCases, icon: AlertTriangle, variant: 'high' as const },
          ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40">
        <div>
          <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider block mb-1">
            {roleDashboard.eyebrow}
          </span>
          <h1 className="text-2xl font-bold text-slate-100">{roleDashboard.title}, {user?.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{roleDashboard.description}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => navigate('/patient-register')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:bg-slate-800 text-cyan-400 font-bold text-xs shadow-md transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={() => navigate(roleDashboard.actionPath)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>{roleDashboard.action}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'ADMIN' ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-4'} gap-4`}>
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      {showAnalytics && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Case Distribution Pie Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Emergency Severity Breakdown</h3>
            <span className="text-[11px] font-mono text-slate-400">{summary.activeEmergencyCases} Active</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.levelDistribution}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {summary.levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
            {summary.levelDistribution.map((lvl) => (
              <div key={lvl.level} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lvl.color }} />
                <span className="text-slate-400">{lvl.level}:</span>
                <span className="font-mono font-bold text-slate-200">{lvl.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Volume Line Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Hourly Emergency Intake Volume</h3>
              <p className="text-[11px] text-slate-400">Cases registered over past 12 hours</p>
            </div>
            <div className="p-1.5 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.hourlyCases}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>}

      {/* Top Priority Queue & Doctor Workload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Priority Queue Snippet */}
        <div className={`p-5 rounded-2xl glass-panel border border-slate-800 space-y-4 ${showDoctorWorkload ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>Top Priority Patients in Queue</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-950 text-red-400 border border-red-500/30 font-mono">
                  Min-Heap Ordered
                </span>
              </h3>
            </div>
            <button
              onClick={() => navigate('/queue')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {summary.topPriorityQueue.map((item) => (
              <div
                key={item.caseId}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs font-bold text-cyan-400 flex items-center justify-center">
                    #{item.queuePosition}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{item.patientName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {item.caseId} • {item.symptoms}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <EmergencyBadge level={item.emergencyLevel} score={item.priorityScore} />
                  <span className="text-xs font-mono text-slate-400">{item.formattedWaitTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Workload Panel */}
        {showDoctorWorkload && <>
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-sm font-bold text-slate-200">Physicians Roster & Workload</h3>
            <button
              onClick={() => navigate('/doctors')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Directory
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {summary.doctorWorkloads.map((doc) => (
              <div key={doc.doctorId} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{doc.doctorName}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      doc.availability === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {doc.availability}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{doc.specialization}</p>
                <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-400">
                  <span>Active Cases:</span>
                  <span className="text-cyan-400 font-bold">{doc.activeCases}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </>}
      </div>
    </div>
  );
};
