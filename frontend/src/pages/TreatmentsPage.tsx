import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { treatmentService } from '../services/treatmentService';
import { emergencyService } from '../services/emergencyService';
import { TreatmentRecord, TreatmentStatus } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';
import { ClipboardList, Save, Search, Stethoscope, CheckCircle2 } from 'lucide-react';

export const TreatmentsPage: React.FC = () => {
  const [caseIdInput, setCaseIdInput] = useState('');
  const [activeCaseId, setActiveCaseId] = useState('EMG-8801');

  const [patientId, setPatientId] = useState('PAT-1001');
  const [doctorId, setDoctorId] = useState('DOC-201');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [medicationNotes, setMedicationNotes] = useState('');
  const [treatmentStatus, setTreatmentStatus] = useState<TreatmentStatus>('IN_PROGRESS');

  const { data: treatmentRecord, refetch } = useQuery({
    queryKey: ['treatment', activeCaseId],
    queryFn: async () => {
      try {
        const record = await treatmentService.getTreatmentByCase(activeCaseId);
        setDiagnosisNotes(record.diagnosisNotes || '');
        setTreatmentNotes(record.treatmentNotes || '');
        setMedicationNotes(record.medicationNotes || '');
        setTreatmentStatus(record.treatmentStatus || 'IN_PROGRESS');
        setPatientId(record.patientId || 'PAT-1001');
        setDoctorId(record.doctorId || 'DOC-201');
        return record;
      } catch (err) {
        return null;
      }
    },
    enabled: !!activeCaseId,
  });

  const saveTreatmentMutation = useMutation({
    mutationFn: (payload: Partial<TreatmentRecord>) => treatmentService.saveTreatmentRecord(payload),
    onSuccess: () => {
      toast.success(`Clinical treatment record saved for ${activeCaseId}`);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save treatment record');
    },
  });

  const handleSearchCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (caseIdInput.trim()) {
      setActiveCaseId(caseIdInput.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveTreatmentMutation.mutate({
      caseId: activeCaseId,
      patientId,
      doctorId,
      diagnosisNotes,
      treatmentNotes,
      medicationNotes,
      treatmentStatus,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-cyan-400" />
          <span>Clinical Treatment & Diagnosis Records</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Record clinical notes, physician diagnosis, medical interventions, and treatment progress.
        </p>
      </div>

      {/* Case Search Form */}
      <form onSubmit={handleSearchCase} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={caseIdInput}
            onChange={(e) => setCaseIdInput(e.target.value)}
            placeholder="Enter Emergency Case ID (e.g. EMG-8801)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs"
        >
          Load Case Record
        </button>
      </form>

      {/* Main Treatment Form */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-cyan-400 font-bold text-sm">Active Case: {activeCaseId}</span>
            <span className="text-xs text-slate-400">Patient: {patientId}</span>
          </div>
          <StatusBadge status={treatmentStatus} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Diagnosis Notes</label>
            <textarea
              rows={3}
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
              placeholder="e.g. Acute Inferolateral STEMI, coronary angiography indicated..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Clinical Interventions & Treatment Notes</label>
            <textarea
              rows={3}
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="e.g. Administered Aspirin 325mg PO, Clopidogrel 600mg PO, Oxygen therapy initiated..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Medications Administered</label>
            <input
              type="text"
              value={medicationNotes}
              onChange={(e) => setMedicationNotes(e.target.value)}
              placeholder="e.g. Heparin 5000u IV bolus, Nitroglycerin sublingual"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Treatment Status Progression</label>
            <div className="flex items-center gap-2">
              {(['WAITING', 'IN_PROGRESS', 'COMPLETED'] as TreatmentStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setTreatmentStatus(status)}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    treatmentStatus === status
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={saveTreatmentMutation.isPending}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-950/50"
            >
              <Save className="w-4 h-4" />
              <span>{saveTreatmentMutation.isPending ? 'Saving Record...' : 'Save Clinical Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
