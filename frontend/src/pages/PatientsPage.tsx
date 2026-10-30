import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { CaseStatus, EmergencyLevel, Patient } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmergencyBadge } from '../components/ui/EmergencyBadge';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';
import {
  Users,
  Search,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Activity,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Clock,
  Filter,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<Patient | null>(null);
  const [selectedPatientForStatus, setSelectedPatientForStatus] = useState<Patient | null>(null);
  const [newStatus, setNewStatus] = useState<CaseStatus>('WAITING');
  const [statusNotes, setStatusNotes] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Patient>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search, priorityFilter, statusFilter],
    queryFn: () => patientService.getPatients(page, 10, search, priorityFilter, statusFilter),
  });

  // Update Patient Mutation
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, patient }: { id: string; patient: Patient }) =>
      patientService.updatePatient(id, patient),
    onSuccess: (updated) => {
      toast.success(`Patient record for ${updated.name} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setSelectedPatientForEdit(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update patient information.');
    },
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: CaseStatus; notes?: string }) =>
      patientService.updatePatientStatus(id, status, notes),
    onSuccess: (updated) => {
      toast.success(`Patient ${updated.patientId} status changed to ${updated.status}`);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedPatientForStatus(null);
      setStatusNotes('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update patient status.');
    },
  });

  const handleOpenEdit = (patient: Patient) => {
    setSelectedPatientForEdit(patient);
    setEditForm({
      ...patient,
      allergies: patient.allergies ? [...patient.allergies] : [],
    });
  };

  const handleOpenStatus = (patient: Patient) => {
    setSelectedPatientForStatus(patient);
    setNewStatus(patient.status || 'WAITING');
    setStatusNotes('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForEdit || !selectedPatientForEdit.id) return;
    updatePatientMutation.mutate({
      id: selectedPatientForEdit.id,
      patient: editForm as Patient,
    });
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForStatus || !selectedPatientForStatus.id) return;
    updateStatusMutation.mutate({
      id: selectedPatientForStatus.id,
      status: newStatus,
      notes: statusNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Patient Management Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, view full clinical profiles, update patient records, and manage live triage status.
          </p>
        </div>

        <button
          onClick={() => navigate('/patient-register')}
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by Patient ID, Name, Phone, or Chief Complaint..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Emergency Priorities</option>
            <option value="LEVEL_1_RESUSCITATION">Level 1 – Resuscitation</option>
            <option value="LEVEL_2_EMERGENCY">Level 2 – Emergency</option>
            <option value="LEVEL_3_URGENT">Level 3 – Urgent</option>
            <option value="LEVEL_4_LESS_URGENT">Level 4 – Less Urgent</option>
            <option value="LEVEL_5_NON_URGENT">Level 5 – Non-Urgent</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Patient Statuses</option>
            <option value="WAITING">WAITING</option>
            <option value="IN_TRIAGE">IN_TRIAGE</option>
            <option value="IN_TREATMENT">IN_TREATMENT</option>
            <option value="ADMITTED">ADMITTED</option>
            <option value="DISCHARGED">DISCHARGED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">No Patient Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No registered patients matched your query or filters. You can clear the search or register a new patient.
            </p>
            <button
              onClick={() => navigate('/patient-register')}
              className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Patient Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Sex</th>
                  <th className="py-3 px-4">Chief Complaint</th>
                  <th className="py-3 px-4">Arrival / Reg Time</th>
                  <th className="py-3 px-4">Emergency Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {data.content.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Patient ID */}
                    <td className="py-3 px-4 font-mono font-semibold text-cyan-400 whitespace-nowrap">
                      {p.patientId}
                    </td>

                    {/* Patient Name & Phone */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{p.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-600" />
                        <span>{p.phone}</span>
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {p.age} yrs • {p.gender}
                    </td>

                    {/* Chief Complaint */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate font-medium text-slate-200" title={p.chiefComplaint}>
                        {p.chiefComplaint || 'Emergency intake'}
                      </div>
                      {p.symptoms && (
                        <div className="text-[10px] text-slate-500 truncate" title={p.symptoms}>
                          {p.symptoms}
                        </div>
                      )}
                    </td>

                    {/* Registration / Arrival Time */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {p.arrivalTime
                            ? new Date(p.arrivalTime).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Emergency Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <EmergencyBadge level={p.emergencyLevel} score={p.priorityScore} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={p.status || 'WAITING'} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPatientForView(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Patient Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenStatus(p)}
                          className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-colors text-[11px] font-semibold px-2 flex items-center gap-1"
                          title="Update Patient Status"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Status</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Edit Patient Information"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {data.number * data.size + 1} -{' '}
              {Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements} patients
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-300">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: VIEW PATIENT DETAILS */}
      {selectedPatientForView && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                  {selectedPatientForView.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{selectedPatientForView.name}</h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                      {selectedPatientForView.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedPatientForView.age} yrs • {selectedPatientForView.gender} • Blood Group:{' '}
                    {selectedPatientForView.bloodGroup || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Priority Ribbon */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Emergency Priority:</span>
                <EmergencyBadge
                  level={selectedPatientForView.emergencyLevel}
                  score={selectedPatientForView.priorityScore}
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Status:</span>
                <StatusBadge status={selectedPatientForView.status || 'WAITING'} />
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Emergency Assessment Vitals
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Temperature</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedPatientForView.temperature ? `${selectedPatientForView.temperature}°F` : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedPatientForView.bloodPressure || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Heart Rate</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedPatientForView.heartRate ? `${selectedPatientForView.heartRate} bpm` : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Resp Rate</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedPatientForView.respiratoryRate
                      ? `${selectedPatientForView.respiratoryRate}/min`
                      : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SpO2</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {selectedPatientForView.oxygenSaturation
                      ? `${selectedPatientForView.oxygenSaturation}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-3 text-xs">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Clinical Details
              </h4>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Chief Complaint</span>
                  <p className="text-slate-200 mt-0.5">{selectedPatientForView.chiefComplaint || 'None specified'}</p>
                </div>
                {selectedPatientForView.symptoms && (
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Symptoms</span>
                    <p className="text-slate-300 mt-0.5">{selectedPatientForView.symptoms}</p>
                  </div>
                )}
                {selectedPatientForView.existingConditions && (
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Existing Medical Conditions</span>
                    <p className="text-slate-300 mt-0.5">{selectedPatientForView.existingConditions}</p>
                  </div>
                )}
                {selectedPatientForView.allergies && selectedPatientForView.allergies.length > 0 && (
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Known Allergies</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPatientForView.allergies.map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-rose-950/60 text-rose-300 border border-rose-500/30"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPatientForView.currentMedications && (
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Current Medications</span>
                    <p className="text-slate-300 mt-0.5">{selectedPatientForView.currentMedications}</p>
                  </div>
                )}
                {selectedPatientForView.medicalHistory && (
                  <div>
                    <span className="text-slate-500 font-medium block text-[11px]">Medical History</span>
                    <p className="text-slate-300 mt-0.5">{selectedPatientForView.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 text-xs">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Contact & Emergency Person</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Patient Contact</span>
                  <div className="mt-1 space-y-0.5 text-slate-300">
                    <p>Phone: {selectedPatientForView.phone}</p>
                    {selectedPatientForView.email && <p>Email: {selectedPatientForView.email}</p>}
                    {selectedPatientForView.address && <p>Address: {selectedPatientForView.address}</p>}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Emergency Contact Person</span>
                  {selectedPatientForView.emergencyContact ? (
                    <div className="mt-1 space-y-0.5 text-slate-300">
                      <p>Name: {selectedPatientForView.emergencyContact.name}</p>
                      <p>Relationship: {selectedPatientForView.emergencyContact.relationship}</p>
                      <p>Phone: {selectedPatientForView.emergencyContact.phone}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic mt-1">None registered</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedPatientForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE PATIENT INFORMATION */}
      {selectedPatientForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">Update Patient Information</h3>
                <p className="text-xs text-slate-400">
                  Editing record for {selectedPatientForEdit.name} ({selectedPatientForEdit.patientId})
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Age</label>
                  <input
                    type="number"
                    value={editForm.age || ''}
                    onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Gender</label>
                  <select
                    value={editForm.gender || 'MALE'}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Chief Complaint</label>
                <textarea
                  rows={2}
                  value={editForm.chiefComplaint || ''}
                  onChange={(e) => setEditForm({ ...editForm, chiefComplaint: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Current Medications</label>
                  <input
                    type="text"
                    value={editForm.currentMedications || ''}
                    onChange={(e) => setEditForm({ ...editForm, currentMedications: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Existing Medical Conditions</label>
                  <input
                    type="text"
                    value={editForm.existingConditions || ''}
                    onChange={(e) => setEditForm({ ...editForm, existingConditions: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Priority Category in edit */}
              <div>
                <label className="block text-slate-300 mb-1">Emergency Priority Category</label>
                <select
                  value={editForm.emergencyLevel || 'LEVEL_3_URGENT'}
                  onChange={(e) =>
                    setEditForm({ ...editForm, emergencyLevel: e.target.value as EmergencyLevel })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="LEVEL_1_RESUSCITATION">Level 1 – Resuscitation</option>
                  <option value="LEVEL_2_EMERGENCY">Level 2 – Emergency</option>
                  <option value="LEVEL_3_URGENT">Level 3 – Urgent</option>
                  <option value="LEVEL_4_LESS_URGENT">Level 4 – Less Urgent</option>
                  <option value="LEVEL_5_NON_URGENT">Level 5 – Non-Urgent</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePatientMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold disabled:opacity-50"
                >
                  {updatePatientMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE PATIENT STATUS */}
      {selectedPatientForStatus && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">Update Patient Triage Status</h3>
                <p className="text-xs text-slate-400">
                  {selectedPatientForStatus.name} ({selectedPatientForStatus.patientId})
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientForStatus(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">New Clinical / Triage Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-medium"
                >
                  <option value="WAITING">WAITING (In waiting room / queue)</option>
                  <option value="IN_TRIAGE">IN_TRIAGE (Under initial nurse triage assessment)</option>
                  <option value="IN_TREATMENT">IN_TREATMENT (Attending physician actively treating)</option>
                  <option value="ADMITTED">ADMITTED (Transferred to inpatient ward / ICU)</option>
                  <option value="DISCHARGED">DISCHARGED (Treated and safely discharged home)</option>
                  <option value="COMPLETED">COMPLETED (Emergency encounter completed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Status Transition Notes</label>
                <textarea
                  rows={2}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Patient called into Bay 4, vitals re-checked, stable"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForStatus(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
