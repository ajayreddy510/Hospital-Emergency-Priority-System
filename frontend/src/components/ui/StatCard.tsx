import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'critical' | 'high' | 'emerald' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return 'border-red-500/30 bg-red-950/20 text-red-400';
      case 'high':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-400';
      case 'emerald':
        return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400';
      case 'cyan':
        return 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400';
      default:
        return 'border-slate-800 bg-slate-900/60 text-slate-400';
    }
  };

  return (
    <div className={`p-4 rounded-xl border glass-panel glass-panel-hover flex items-start justify-between relative overflow-hidden ${getVariantStyles()}`}>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
        <Icon className="w-5 h-5 text-slate-200" />
      </div>
    </div>
  );
};
