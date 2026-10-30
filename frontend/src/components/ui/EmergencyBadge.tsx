import React from 'react';
import { EmergencyLevel } from '../../types';
import { AlertCircle, AlertTriangle, Activity, Clock } from 'lucide-react';

interface EmergencyBadgeProps {
  level: EmergencyLevel;
  score?: number;
  showIcon?: boolean;
}

export const EmergencyBadge: React.FC<EmergencyBadgeProps> = ({ level, score, showIcon = true }) => {
  const getBadgeStyle = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-950/80 text-red-300 border-red-500/50 shadow-red-900/20',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-400 animate-pulse" />,
          label: 'CRITICAL (Triage Priority 1)',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-900/20',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'HIGH (Triage Priority 2)',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-900/20',
          icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'MEDIUM (Triage Priority 3)',
        };
      case 'LOW':
        return {
          bg: 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-blue-900/20',
          icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
          label: 'LOW (Triage Priority 4)',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: null,
          label: level,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-sm ${style.bg}`}>
      {showIcon && style.icon}
      <span>{level}</span>
      {score !== undefined && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">[{score} pts]</span>
      )}
    </span>
  );
};
