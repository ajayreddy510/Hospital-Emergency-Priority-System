import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'destructive';
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 text-amber-400">
            <div className="p-2 bg-amber-950/50 border border-amber-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-100">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors disabled:opacity-50 ${
              confirmVariant === 'destructive'
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
