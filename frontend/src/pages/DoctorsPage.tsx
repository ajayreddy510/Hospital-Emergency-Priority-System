import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctorService';
import { DoctorAvailability } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { Stethoscope, UserCheck, Activity, Phone, Mail, Building } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const { user } = useAuth();
  const canManageAvailability = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAllDoctors,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DoctorAvailability }) =>
      doctorService.updateAvailability(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Doctor availability status set to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update doctor status');
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-cyan-400" />
          <span>Physicians Roster & Workload Directory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor physician availability, active emergency workload, and department assignments.
        </p>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doc) => (
          <div
            key={doc.id || doc.doctorId}
            className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 glass-panel-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{doc.name}</h3>
                    <p className="text-[11px] font-mono text-cyan-400">{doc.doctorId}</p>
                  </div>
                </div>
                <StatusBadge status={doc.availabilityStatus} />
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{doc.specialization} • {doc.department}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{doc.phone || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{doc.email || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Workload:</span>
                <span className="font-mono font-bold text-cyan-400">{doc.activeCasesCount || 0} active cases</span>
              </div>

              {/* Status Toggle Buttons */}
              {canManageAvailability && <div className="flex items-center gap-1.5 pt-1">
                {(['AVAILABLE', 'BUSY', 'OFFLINE'] as DoctorAvailability[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatusMutation.mutate({ id: doc.id || doc.doctorId || '', status })}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-semibold border transition-all ${
                      doc.availabilityStatus === status
                        ? status === 'AVAILABLE'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                          : status === 'BUSY'
                          ? 'bg-amber-950 text-amber-400 border-amber-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-slate-950/40 text-slate-500 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
