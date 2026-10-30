import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { treatmentService } from '../services/treatmentService';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  Calendar,
} from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getPatientById(id || ''),
    enabled: !!id,
  });

  const { data: treatments = [] } = useQuery({
    queryKey: ['patient-treatments', id],
    queryFn: () => treatmentService.getTreatmentsByPatient(id || ''),
    enabled: !!id,
  });

  if (isPatientLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-red-400 font-semibold">Patient record not found.</p>
        <button onClick={() => navigate('/patients')} className="text-xs text-cyan-400 hover:underline">
          Back to Patients Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/patients')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Patients Directory</span>
      </button>

      {/* Patient Profile Card Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 font-bold text-xl flex items-center justify-center shadow-lg">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{patient.name}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {patient.patientId}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {patient.age} yrs • {patient.gender} • Registered {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/emergency/new?patientId=${patient.patientId}`)}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-cyan-950/50"
          >
            <HeartPulse className="w-4 h-4" />
            <span>New Emergency Case</span>
          </button>
        </div>
      </div>

      {/* Detailed Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact & Demographics */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Demographics & Contact</h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{patient.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{patient.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{patient.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Medical Allergies & Blood Group */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Clinical Vitals & Allergies</h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Blood Group:</span>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-500/30">
                {patient.bloodGroup || 'Not Tested'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Known Allergies:</span>
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-amber-950 text-amber-300 border border-amber-500/30">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-500 italic">No known drug allergies reported</span>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">Next of Kin / Emergency Contact</h3>
          {patient.emergencyContact ? (
            <div className="space-y-1.5 text-xs text-slate-300">
              <p><strong className="text-slate-100">Name:</strong> {patient.emergencyContact.name}</p>
              <p><strong className="text-slate-100">Relation:</strong> {patient.emergencyContact.relationship}</p>
              <p><strong className="text-slate-100">Phone:</strong> {patient.emergencyContact.phone}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No emergency contact info provided.</p>
          )}
        </div>
      </div>

      {/* Clinical Treatment History Timeline */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-cyan-400" />
          <span>Treatment & Diagnosis Notes History</span>
        </h3>

        {treatments.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No past treatment records found for this patient.</p>
        ) : (
          <div className="space-y-3">
            {treatments.map((tr) => (
              <div key={tr.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-bold">{tr.caseId}</span>
                    <StatusBadge status={tr.treatmentStatus} />
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {tr.createdAt ? new Date(tr.createdAt).toLocaleString() : ''}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-300 block">Diagnosis Notes:</strong>
                  <p className="text-slate-400">{tr.diagnosisNotes || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-slate-300 block">Clinical Interventions & Notes:</strong>
                  <p className="text-slate-400">{tr.treatmentNotes || 'N/A'}</p>
                </div>
                {tr.medicationNotes && (
                  <div>
                    <strong className="text-slate-300 block">Medications Administered:</strong>
                    <p className="text-slate-400">{tr.medicationNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
