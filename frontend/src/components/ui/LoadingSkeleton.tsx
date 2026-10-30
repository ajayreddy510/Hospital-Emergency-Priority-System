import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 bg-slate-800/40 rounded-lg border border-slate-800/60" />
      ))}
    </div>
  );
};
