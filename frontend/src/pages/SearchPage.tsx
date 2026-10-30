import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../services/patientService';
import { emergencyService } from '../services/emergencyService';
import { doctorService } from '../services/doctorService';
import { Search, Users, AlertCircle, Stethoscope, ArrowRight } from 'lucide-react';
import { EmergencyBadge } from '../components/ui/EmergencyBadge';
import { StatusBadge } from '../components/ui/StatusBadge';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { data: patientsData } = useQuery({
    queryKey: ['search-patients', query],
    queryFn: () => patientService.getPatients(0, 10, query),
    enabled: query.length > 0,
  });

  const { data: allCases = [] } = useQuery({
    queryKey: ['search-cases'],
    queryFn: emergencyService.getAllCases,
    enabled: query.length > 0,
  });

  const { data: allDoctors = [] } = useQuery({
    queryKey: ['search-doctors'],
    queryFn: doctorService.getAllDoctors,
    enabled: query.length > 0,
  });

  const filteredCases = allCases.filter((c) =>
    c.caseId?.toLowerCase().includes(query.toLowerCase()) ||
    c.patientId?.toLowerCase().includes(query.toLowerCase()) ||
    c.symptoms?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDoctors = allDoctors.filter((d) =>
    d.name?.toLowerCase().includes(query.toLowerCase()) ||
    d.doctorId?.toLowerCase().includes(query.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" />
          <span>Global Search Directory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search across Patients, Emergency Triage Cases, and Physician Rosters.
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Patient ID (PAT-1001), Case ID (EMG-8801), Doctor, Name..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
        />
      </form>

      {!query.trim() ? (
        <div className="p-12 text-center text-slate-500 text-xs">
          Enter a search query above to inspect records across all system modules.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Patients Results */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Matching Patients ({patientsData?.content.length || 0})</span>
            </h3>
            {patientsData?.content.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No matching patients found.</p>
            ) : (
              <div className="space-y-2">
                {patientsData?.content.map((p) => (
                  <div
                    key={p.patientId}
                    onClick={() => navigate(`/patients/${p.id || p.patientId}`)}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-100">{p.name}</span>
                      <span className="ml-2 font-mono text-cyan-400">{p.patientId}</span>
                      <p className="text-[11px] text-slate-400">Phone: {p.phone} • Blood: {p.bloodGroup}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Cases Results */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Matching Emergency Cases ({filteredCases.length})</span>
            </h3>
            {filteredCases.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No matching emergency cases found.</p>
            ) : (
              <div className="space-y-2">
                {filteredCases.map((c) => (
                  <div
                    key={c.caseId}
                    onClick={() => navigate('/queue')}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-cyan-400">{c.caseId}</span>
                      <span className="ml-2 text-slate-300">Patient: {c.patientId}</span>
                      <p className="text-[11px] text-slate-400 truncate">{c.symptoms}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EmergencyBadge level={c.emergencyLevel} score={c.priorityScore} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Doctors Results */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Matching Physicians ({filteredDoctors.length})</span>
            </h3>
            {filteredDoctors.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No matching physicians found.</p>
            ) : (
              <div className="space-y-2">
                {filteredDoctors.map((d) => (
                  <div
                    key={d.doctorId}
                    onClick={() => navigate('/doctors')}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-100">{d.name}</span>
                      <span className="ml-2 font-mono text-cyan-400">{d.doctorId}</span>
                      <p className="text-[11px] text-slate-400">{d.specialization} • {d.department}</p>
                    </div>
                    <StatusBadge status={d.availabilityStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
