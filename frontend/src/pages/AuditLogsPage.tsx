import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ShieldCheck, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => auditService.getAuditLogs(page, 20),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>System Operational Audit Trail</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete medical and administrative compliance audit logs for priority overrides, doctor assignments, and security actions.
        </p>
      </div>

      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No audit log records recorded yet.
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 uppercase text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">User & Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity ID</th>
                    <th className="px-4 py-3">Change (Old → New)</th>
                    <th className="px-4 py-3">Reason / Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {data.content.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <div>
                            <p className="font-semibold text-slate-200">{log.userName || log.userId}</p>
                            <p className="text-[10px] font-mono text-cyan-400">{log.userRole}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">{log.entityId}</td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                        {log.oldValue || log.newValue ? (
                          <span>
                            <span className="text-slate-500">{log.oldValue || 'NONE'}</span>
                            <span className="mx-1 text-cyan-400">→</span>
                            <span className="text-emerald-400 font-bold">{log.newValue || 'NONE'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 max-w-xs truncate" title={log.reason}>
                        {log.reason || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing Page {data.number + 1} of {data.totalPages} ({data.totalElements} audit entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={data.number === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={data.number + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
