import React from 'react';
import { EmergencyLevel } from '../../types';
import { AlertCircle, AlertTriangle, Activity, Clock, ShieldAlert } from 'lucide-react';

interface EmergencyBadgeProps {
  level?: EmergencyLevel;
  score?: number;
  showIcon?: boolean;
}

export const EmergencyBadge: React.FC<EmergencyBadgeProps> = ({ level = 'LEVEL_3_URGENT', score, showIcon = true }) => {
  const getBadgeStyle = () => {
    switch (level) {
      case 'LEVEL_1_RESUSCITATION':
      case 'CRITICAL':
        return {
          bg: 'bg-red-950/80 text-red-300 border-red-500/50 shadow-red-900/20',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />,
          label: 'Level 1 – Resuscitation',
        };
      case 'LEVEL_2_EMERGENCY':
      case 'HIGH':
        return {
          bg: 'bg-orange-950/80 text-orange-300 border-orange-500/50 shadow-orange-900/20',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />,
          label: 'Level 2 – Emergency',
        };
      case 'LEVEL_3_URGENT':
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-900/20',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Level 3 – Urgent',
        };
      case 'LEVEL_4_LESS_URGENT':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-900/20',
          icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Level 4 – Less Urgent',
        };
      case 'LEVEL_5_NON_URGENT':
      case 'LOW':
        return {
          bg: 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-blue-900/20',
          icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Level 5 – Non-Urgent',
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
      <span>{style.label}</span>
      {score !== undefined && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">[{score} pts]</span>
      )}
    </span>
  );
};
