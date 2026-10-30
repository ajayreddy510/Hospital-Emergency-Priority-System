import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const MedicalDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2 max-w-5xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>DEMONSTRATION & EDUCATIONAL PURPOSE ONLY:</strong> Administrative emergency queue prioritization system. This software does not perform clinical diagnosis or replace certified medical decision-support systems. Authorized medical staff retain full authority to review and manually override priority levels at any time.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[11px] text-amber-400 font-mono">
        <Info className="w-3.5 h-3.5" />
        <span>Audit Trail Active</span>
      </div>
    </div>
  );
};
