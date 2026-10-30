import React, { useState } from 'react';
import { EmergencyLevel, QueueItem } from '../../types';
import { emergencyService } from '../../services/emergencyService';
import { toast } from 'sonner';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';

interface PriorityOverrideModalProps {
  caseItem: QueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PriorityOverrideModal: React.FC<PriorityOverrideModalProps> = ({
  caseItem,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newLevel, setNewLevel] = useState<EmergencyLevel>(caseItem?.emergencyLevel || 'HIGH');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !caseItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Medical audit compliance requires an explicit reason for priority override.');
      return;
    }

    setIsSubmitting(true);
    try {
      await emergencyService.overridePriority(caseItem.id || caseItem.caseId, {
        newLevel,
        reason: reason.trim(),
      });
      toast.success(`Priority for ${caseItem.patientName} (${caseItem.caseId}) updated to ${newLevel}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update emergency priority');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-semibold text-slate-100">Manual Priority Override</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
            <p><strong className="text-slate-100">Patient:</strong> {caseItem.patientName} ({caseItem.patientId})</p>
            <p><strong className="text-slate-100">Case ID:</strong> {caseItem.caseId}</p>
            <p><strong className="text-slate-100">Current Level:</strong> <span className="font-semibold text-amber-400">{caseItem.emergencyLevel}</span> ({caseItem.priorityScore} pts)</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">New Administrative Emergency Level</label>
            <div className="grid grid-cols-2 gap-2">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as EmergencyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setNewLevel(level)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                    newLevel === level
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{level}</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {level === 'CRITICAL' ? '100 pts' : level === 'HIGH' ? '75 pts' : level === 'MEDIUM' ? '50 pts' : '25 pts'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Reason for Manual Override <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide clinical/triage observation justification (e.g. Oxygen saturation dropped to 88%, patient vitals altered)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="bg-amber-950/30 border border-amber-500/20 p-3 rounded-lg flex items-start gap-2 text-[11px] text-amber-300/90">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>This override will be logged in the official system audit log along with your user ID and timestamp.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Override & Audit Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
