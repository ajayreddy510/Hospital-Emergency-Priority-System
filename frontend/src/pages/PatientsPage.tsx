import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { Patient } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import {
  Users,
  Search,
  UserPlus,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Phone,
  Mail,
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const { user } = useAuth();
  const canRegisterPatient = user?.role !== 'DOCTOR';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O_POSITIVE');

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => patientService.getPatients(page, 10, search),
  });

  const createPatientMutation = useMutation({
    mutationFn: (newPatient: Patient) => patientService.createPatient(newPatient),
    onSuccess: (created) => {
      toast.success(`Patient ${created.name} (${created.patientId}) registered successfully!`);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to register patient');
    },
  });

  const resetForm = () => {
    setName('');
    setAge(30);
    setGender('MALE');
    setPhone('');
    setEmail('');
    setAddress('');
    setBloodGroup('O_POSITIVE');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPatientMutation.mutate({
      name,
      age,
      gender,
      phone,
      email,
      address,
      bloodGroup,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Patient Registry Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and view full patient profiles, triage history, and treatment records.
          </p>
        </div>

        {canRegisterPatient && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/50"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search by Patient ID, Name, Phone, or Email..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Patients Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No Patient Records Found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search filters or register a new patient.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 uppercase text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-3">Patient ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Age / Gender</th>
                    <th className="px-4 py-3">Contact Phone</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Registered Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {data.content.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-cyan-400 font-bold">
                        {patient.patientId}
                      </td>
                      <td className="px-4 py-3.5 text-slate-200 font-semibold">{patient.name}</td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {patient.age} yrs • {patient.gender}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {patient.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/60 text-red-400 border border-red-500/30">
                          {patient.bloodGroup || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/patients/${patient.id || patient.patientId}`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/50 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing Page {data.number + 1} of {data.totalPages} ({data.totalElements} patients)
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

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>Patient Registration Intake</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Eleanor Vance"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1-555-0192"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="742 Evergreen Terrace"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
                >
                  {createPatientMutation.isPending ? 'Registering...' : 'Complete Intake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
