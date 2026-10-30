import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueService } from '../services/queueService';
import { doctorService } from '../services/doctorService';
import { emergencyService } from '../services/emergencyService';
import { QueueItem, Doctor, CaseStatus } from '../types';
import { EmergencyBadge } from '../components/ui/EmergencyBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityOverrideModal } from '../components/ui/PriorityOverrideModal';
import { DoctorAssignmentModal } from '../components/ui/DoctorAssignmentModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import {
  Activity,
  UserCheck,
  ShieldAlert,
  UserPlus,
  Play,
  CheckCircle,
  RefreshCw,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export const QueuePage: React.FC = () => {
  const { user } = useAuth();
  const canTriage = user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE';
  const canTreat = user?.role === 'ADMIN' || user?.role === 'DOCTOR';
  const queryClient = useQueryClient();
  const [selectedCaseForOverride, setSelectedCaseForOverride] = useState<QueueItem | null>(null);
  const [selectedCaseForDoctor, setSelectedCaseForDoctor] = useState<QueueItem | null>(null);
  const [nextPatientModalOpen, setNextPatientModalOpen] = useState(false);
  const [nextPatient, setNextPatient] = useState<QueueItem | null>(null);

  const { data: queue = [], isLoading, refetch } = useQuery({
    queryKey: ['queue'],
    queryFn: queueService.getActiveQueue,
    refetchInterval: 5000,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAllDoctors,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CaseStatus }) =>
      emergencyService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Case status updated to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update case status');
    },
  });

  const handleFetchNextPatient = async () => {
    try {
      const next = await queueService.getNextPatient();
      if (next) {
        setNextPatient(next);
        setNextPatientModalOpen(true);
      } else {
        toast.info('Emergency queue is currently empty.');
      }
    } catch (err: any) {
      toast.error('Failed to fetch next patient');
    }
  };

  const handleStartTreatment = (caseId: string) => {
    updateStatusMutation.mutate({ id: caseId, status: 'IN_TREATMENT' });
  };

  const handleMarkCompleted = (caseId: string) => {
    updateStatusMutation.mutate({ id: caseId, status: 'COMPLETED' });
  };

  const criticalCount = queue.filter((i) => i.emergencyLevel === 'CRITICAL').length;
  const highCount = queue.filter((i) => i.emergencyLevel === 'HIGH').length;
  const mediumCount = queue.filter((i) => i.emergencyLevel === 'MEDIUM').length;
  const lowCount = queue.filter((i) => i.emergencyLevel === 'LOW').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Emergency Priority Command Center</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              LIVE HEAP QUEUE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Heap-ordered priority queue based on severity score and arrival timestamp tie-breaking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {canTreat && (
            <button
              onClick={handleFetchNextPatient}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50"
            >
              <UserCheck className="w-4 h-4" />
              <span>Call Next Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Queue Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Active</span>
          <span className="text-xl font-bold font-mono text-slate-100">{queue.length}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-red-500/30 bg-red-950/20 text-center">
          <span className="text-[10px] uppercase font-mono text-red-400 block">Critical (P1)</span>
          <span className="text-xl font-bold font-mono text-red-300">{criticalCount}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-amber-500/30 bg-amber-950/20 text-center">
          <span className="text-[10px] uppercase font-mono text-amber-400 block">High (P2)</span>
          <span className="text-xl font-bold font-mono text-amber-300">{highCount}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-emerald-500/30 bg-emerald-950/20 text-center">
          <span className="text-[10px] uppercase font-mono text-emerald-400 block">Medium (P3)</span>
          <span className="text-xl font-bold font-mono text-emerald-300">{mediumCount}</span>
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-blue-500/30 bg-blue-950/20 text-center">
          <span className="text-[10px] uppercase font-mono text-blue-400 block">Low (P4)</span>
          <span className="text-xl font-bold font-mono text-blue-300">{lowCount}</span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Activity className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Active Emergency Cases in Queue</h3>
            <p className="text-xs text-slate-500">All registered patients have completed treatment or the queue is empty.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="px-4 py-3"># Pos</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Emergency Level</th>
                  <th className="px-4 py-3">Arrival</th>
                  <th className="px-4 py-3">Wait Time</th>
                  <th className="px-4 py-3">Assigned Doctor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {queue.map((item) => {
                  const isTopPriority = item.queuePosition === 1;
                  return (
                    <tr
                      key={item.caseId}
                      className={`transition-colors ${
                        isTopPriority
                          ? 'bg-cyan-950/30 border-l-4 border-l-cyan-500'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                            isTopPriority
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-950'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          #{item.queuePosition}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-semibold text-slate-100">{item.patientName}</p>
                          <p className="text-[11px] text-slate-400 font-normal">
                            {item.patientAge ? `${item.patientAge} yrs` : ''} • {item.patientGender || ''}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-300">{item.caseId}</td>

                      <td className="px-4 py-3.5">
                        <EmergencyBadge level={item.emergencyLevel} score={item.priorityScore} />
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-400 text-[11px]">
                        {item.arrivalTime ? new Date(item.arrivalTime).toLocaleTimeString() : 'N/A'}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 font-mono text-slate-300">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.formattedWaitTime}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300">
                        {item.assignedDoctorName || 'Unassigned'}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canTriage && (
                            <>
                              <button
                                onClick={() => setSelectedCaseForOverride(item)}
                                className="p-1.5 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-500/30 hover:bg-amber-900/40 transition-colors"
                                title="Override Emergency Priority"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSelectedCaseForDoctor(item)}
                                className="p-1.5 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/40 transition-colors"
                                title="Assign Doctor"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {canTreat && (item.status === 'WAITING' || item.status === 'IN_TRIAGE') ? (
                            <button
                              onClick={() => handleStartTreatment(item.id || item.caseId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              <span>Treat</span>
                            </button>
                          ) : canTreat ? (
                            <button
                              onClick={() => handleMarkCompleted(item.id || item.caseId)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PriorityOverrideModal
        caseItem={selectedCaseForOverride}
        isOpen={!!selectedCaseForOverride}
        onClose={() => setSelectedCaseForOverride(null)}
        onSuccess={() => refetch()}
      />

      <DoctorAssignmentModal
        caseItem={selectedCaseForDoctor}
        doctors={doctors}
        isOpen={!!selectedCaseForDoctor}
        onClose={() => setSelectedCaseForDoctor(null)}
        onSuccess={() => refetch()}
      />

      {/* Next Patient Modal */}
      <ConfirmDialog
        isOpen={nextPatientModalOpen}
        title="Next Priority Patient Selected"
        description={
          nextPatient
            ? `Highest priority patient in queue is ${nextPatient.patientName} (${nextPatient.caseId}) with ${nextPatient.emergencyLevel} priority (${nextPatient.priorityScore} points). Would you like to call this patient into triage?`
            : ''
        }
        confirmText="Confirm Intake Call"
        onClose={() => setNextPatientModalOpen(false)}
        onConfirm={() => {
          if (nextPatient) {
            handleStartTreatment(nextPatient.id || nextPatient.caseId);
          }
          setNextPatientModalOpen(false);
        }}
      />
    </div>
  );
};
