import React from 'react';
import { CaseStatus, DoctorAvailability, TreatmentStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus | DoctorAvailability | TreatmentStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'WAITING':
        return 'bg-amber-950/40 text-amber-400 border-amber-500/30';
      case 'IN_TRIAGE':
        return 'bg-purple-950/40 text-purple-400 border-purple-500/30';
      case 'IN_TREATMENT':
      case 'IN_PROGRESS':
        return 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30';
      case 'ADMITTED':
        return 'bg-indigo-950/40 text-indigo-400 border-indigo-500/30';
      case 'DISCHARGED':
        return 'bg-teal-950/40 text-teal-400 border-teal-500/30';
      case 'COMPLETED':
      case 'AVAILABLE':
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
      case 'BUSY':
      case 'CANCELLED':
        return 'bg-rose-950/40 text-rose-400 border-rose-500/30';
      case 'OFFLINE':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono tracking-wider font-medium border ${getStyle()}`}>
      {status}
    </span>
  );
};
