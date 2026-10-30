import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';
import { emergencyService } from '../services/emergencyService';
import { EmergencyLevel, EmergencyCase } from '../types';
import { EmergencyBadge } from '../components/ui/EmergencyBadge';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Stethoscope,
  Info,
  ArrowRight,
} from 'lucide-react';

export const EmergencyNewPage: React.FC = () => {
  const { user } = useAuth();
  const canAssignDoctor = user?.role !== 'RECEPTIONIST';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';

  const [patientId, setPatientId] = useState(initialPatientId);
  const [symptoms, setSymptoms] = useState('');
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>('HIGH');
  const [assignedDoctorId, setAssignedDoctorId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: patientsData } = useQuery({
    queryKey: ['patients-all'],
    queryFn: () => patientService.getPatients(0, 100, ''),
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: doctorService.getAllDoctors,
  });

  const createCaseMutation = useMutation({
    mutationFn: (payload: Partial<EmergencyCase>) => emergencyService.createCase(payload),
    onSuccess: (created) => {
      toast.success(`Emergency Intake ${created.caseId} created and inserted into Heap Priority Queue!`);
      navigate('/queue');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create emergency triage case');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error('Please select a registered patient.');
      return;
    }
    if (!symptoms.trim()) {
      toast.error('Please provide a detailed symptoms description.');
      return;
    }

    createCaseMutation.mutate({
      patientId,
      symptoms: symptoms.trim(),
      emergencyLevel,
      assignedDoctorId: assignedDoctorId || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const getPriorityScorePreview = () => {
    switch (emergencyLevel) {
      case 'CRITICAL':
        return 100;
      case 'HIGH':
        return 75;
      case 'MEDIUM':
        return 50;
      case 'LOW':
        return 25;
      default:
        return 25;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-cyan-400" />
          <span>New Emergency Triage Intake</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Register new emergency triage cases. Priority will be automatically computed by the backend Min-Heap algorithm.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">1. Patient Identification</h3>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Registered Patient *</label>
            <select
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Choose Patient from Registry --</option>
              {patientsData?.content.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.name} ({p.patientId}) • Age: {p.age} • Blood: {p.bloodGroup || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Symptoms Intake */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">2. Clinical Symptoms Description</h3>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Primary Presenting Symptoms *</label>
            <textarea
              required
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms (e.g. Severe crushing chest pain radiating to left shoulder, diaphoresis, dyspnea)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Emergency Severity Level Selection */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200">3. Emergency Severity Level Assignment</h3>
            <span className="text-xs font-mono font-bold text-cyan-400">
              Calculated Priority: {getPriorityScorePreview()} pts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                level: 'CRITICAL' as EmergencyLevel,
                score: '100 pts',
                desc: 'Red - Immediate life-saving intervention required (STEMI, stroke, severe trauma)',
                color: 'border-red-500/50 bg-red-950/30 text-red-300',
              },
              {
                level: 'HIGH' as EmergencyLevel,
                score: '75 pts',
                desc: 'Yellow - Urgent emergency care needed within 15-30 mins (severe dyspnea, MVA trauma)',
                color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
              },
              {
                level: 'MEDIUM' as EmergencyLevel,
                score: '50 pts',
                desc: 'Green - Semi-urgent medical condition (high fever, moderate pain, pediatric intake)',
                color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300',
              },
              {
                level: 'LOW' as EmergencyLevel,
                score: '25 pts',
                desc: 'Blue - Non-urgent administrative triage queue (minor lacerations, routine intake)',
                color: 'border-blue-500/50 bg-blue-950/30 text-blue-300',
              },
            ].map((item) => (
              <div
                key={item.level}
                onClick={() => setEmergencyLevel(item.level)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  emergencyLevel === item.level
                    ? `${item.color} ring-2 ring-cyan-500 shadow-lg`
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{item.level}</span>
                  <span className="font-mono text-[10px] font-semibold">{item.score}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{item.desc}</p>
                <p className="text-[10px] font-mono text-slate-400 italic">
                  Administrative emergency queue priority level for demonstration purposes
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Assignment & Intake Notes */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">4. Doctor Assignment & Triage Notes</h3>
          <div className={`grid grid-cols-1 ${canAssignDoctor ? 'sm:grid-cols-2' : ''} gap-4`}>
            {canAssignDoctor && <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Assign Doctor (Optional - Auto Allocator Available)</label>
              <select
                value={assignedDoctorId}
                onChange={(e) => setAssignedDoctorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Recommend Optimal Available Doctor --</option>
                {doctors.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.name} ({d.specialization}) - {d.availabilityStatus} ({d.activeCasesCount} active)
                  </option>
                ))}
              </select>
            </div>}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Intake Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Patient arrived via EMS ambulance unit 4."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/queue')}
            className="px-5 py-3 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createCaseMutation.isPending}
            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-xl shadow-cyan-950/50"
          >
            {createCaseMutation.isPending ? 'Processing Intake...' : 'Submit Emergency Intake to Queue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
