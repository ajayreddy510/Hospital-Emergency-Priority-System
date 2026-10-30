import React, { useState } from 'react';
import { Doctor, QueueItem } from '../../types';
import { emergencyService } from '../../services/emergencyService';
import { toast } from 'sonner';
import { X, UserPlus, Stethoscope, Check } from 'lucide-react';

interface DoctorAssignmentModalProps {
  caseItem: QueueItem | null;
  doctors: Doctor[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DoctorAssignmentModal: React.FC<DoctorAssignmentModalProps> = ({
  caseItem,
  doctors,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !caseItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      toast.error('Please select a doctor to assign.');
      return;
    }

    setIsSubmitting(true);
    try {
      await emergencyService.assignDoctor(caseItem.id || caseItem.caseId, selectedDoctorId, notes);
      toast.success(`Doctor assigned to case ${caseItem.caseId}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-cyan-400">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-semibold text-slate-100">Doctor Allocation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300">
            <p><strong className="text-slate-100">Patient:</strong> {caseItem.patientName}</p>
            <p><strong className="text-slate-100">Case ID:</strong> {caseItem.caseId}</p>
            <p><strong className="text-slate-100">Symptoms:</strong> {caseItem.symptoms}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Available Physicians Directory</label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {doctors.map((doc) => (
                <div
                  key={doc.doctorId}
                  onClick={() => setSelectedDoctorId(doc.doctorId || '')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedDoctorId === doc.doctorId
                      ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{doc.name}</p>
                      <p className="text-[11px] text-slate-400">{doc.specialization} • {doc.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                      doc.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {doc.availabilityStatus}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">{doc.activeCasesCount || 0} active cases</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assignment Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assigned per cardiology consultation recommendation"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDoctorId}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Assigning...' : 'Assign Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
