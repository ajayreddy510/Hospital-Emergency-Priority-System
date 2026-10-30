import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { EmergencyLevel, Patient } from '../types';
import { toast } from 'sonner';
import {
  Activity,
  User,
  HeartPulse,
  Phone,
  MapPin,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Thermometer,
  Wind,
  FileText,
} from 'lucide-react';
import { EmergencyBadge } from '../components/ui/EmergencyBadge';

export const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  // Form State - Section 1: Personal Information
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(35);
  const [gender, setGender] = useState('MALE');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O_POSITIVE');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRel, setEmergencyContactRel] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Form State - Section 2: Medical Information
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [existingConditions, setExistingConditions] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Form State - Section 3: Emergency Assessment & Vitals
  const [temperature, setTemperature] = useState<number | ''>(98.6);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState<number | ''>(75);
  const [respiratoryRate, setRespiratoryRate] = useState<number | ''>(16);
  const [oxygenSaturation, setOxygenSaturation] = useState<number | ''>(98);
  const [arrivalTime, setArrivalTime] = useState(new Date().toISOString().slice(0, 16));
  const [emergencyLevel, setEmergencyLevel] = useState<EmergencyLevel>('LEVEL_3_URGENT');
  const [isEvaluatingTriage, setIsEvaluatingTriage] = useState(false);
  const [triageRationale, setTriageRationale] = useState<string[]>([]);
  const [triageDisclaimer, setTriageDisclaimer] = useState<string>('');

  // Auto-evaluation assistance based on clinically reviewed ESI/CTAS guidelines
  const handleAutoEvaluateTriage = async () => {
    setIsEvaluatingTriage(true);
    try {
      const result = await patientService.evaluateTriage({
        temperature: temperature === '' ? undefined : Number(temperature),
        bloodPressure,
        heartRate: heartRate === '' ? undefined : Number(heartRate),
        respiratoryRate: respiratoryRate === '' ? undefined : Number(respiratoryRate),
        oxygenSaturation: oxygenSaturation === '' ? undefined : Number(oxygenSaturation),
        chiefComplaint,
        symptoms,
      });

      setEmergencyLevel(result.recommendedLevel);
      setTriageRationale(result.clinicalRationale);
      setTriageDisclaimer(result.disclaimer);
      toast.info(`Triage Protocol Recommendation: ${result.recommendedLevel}`, {
        description: 'Multi-parameter vitals assessed. Staff may confirm or adjust category.',
      });
    } catch (err: any) {
      toast.error('Could not compute automatic triage assessment.');
    } finally {
      setIsEvaluatingTriage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Patient full name is required');
      return;
    }
    if (!phone.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!chiefComplaint.trim()) {
      toast.error('Chief complaint / reason for visit is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const allergies = allergiesInput
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const payload: Patient = {
        name: name.trim(),
        age: Number(age) || 0,
        gender,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        bloodGroup,
        chiefComplaint: chiefComplaint.trim(),
        symptoms: symptoms.trim() || undefined,
        existingConditions: existingConditions.trim() || undefined,
        allergies,
        currentMedications: currentMedications.trim() || undefined,
        medicalHistory: medicalHistory.trim() || undefined,
        temperature: temperature === '' ? undefined : Number(temperature),
        bloodPressure: bloodPressure.trim() || undefined,
        heartRate: heartRate === '' ? undefined : Number(heartRate),
        respiratoryRate: respiratoryRate === '' ? undefined : Number(respiratoryRate),
        oxygenSaturation: oxygenSaturation === '' ? undefined : Number(oxygenSaturation),
        arrivalTime: arrivalTime ? new Date(arrivalTime).toISOString() : new Date().toISOString(),
        emergencyLevel,
        status: 'WAITING',
        emergencyContact: emergencyContactPhone
          ? {
              name: emergencyContactName.trim() || 'Emergency Contact',
              relationship: emergencyContactRel.trim() || 'Family',
              phone: emergencyContactPhone.trim(),
            }
          : undefined,
      };

      const created = await patientService.createPatient(payload);
      setRegisteredPatient(created);
      toast.success(`Patient registered successfully! Assigned ID: ${created.patientId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete patient registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRegisteredPatient(null);
    setName('');
    setAge(35);
    setGender('MALE');
    setPhone('');
    setEmail('');
    setAddress('');
    setEmergencyContactName('');
    setEmergencyContactRel('');
    setEmergencyContactPhone('');
    setChiefComplaint('');
    setSymptoms('');
    setExistingConditions('');
    setAllergiesInput('');
    setCurrentMedications('');
    setMedicalHistory('');
    setTemperature(98.6);
    setBloodPressure('120/80');
    setHeartRate(75);
    setRespiratoryRate(16);
    setOxygenSaturation(98);
    setArrivalTime(new Date().toISOString().slice(0, 16));
    setEmergencyLevel('LEVEL_3_URGENT');
    setTriageRationale([]);
    setTriageDisclaimer('');
  };

  if (registeredPatient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
        <div className="max-w-xl w-full p-8 rounded-3xl glass-panel border border-cyan-500/30 text-center space-y-6 shadow-2xl shadow-cyan-950/50">
          <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-cyan-400" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              UNIQUE PATIENT ID: {registeredPatient.patientId}
            </span>
            <h2 className="text-2xl font-bold text-slate-100">Patient Registration Successful</h2>
            <p className="text-xs text-slate-400">
              The patient has been securely registered into the hospital database and synchronized with the emergency priority queue.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Full Name</span>
              <span className="font-semibold text-slate-200">{registeredPatient.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Age & Gender</span>
              <span className="font-semibold text-slate-200">
                {registeredPatient.age} yrs • {registeredPatient.gender}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Contact Phone</span>
              <span className="font-semibold text-slate-200">{registeredPatient.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Triage Priority</span>
              <div className="mt-0.5">
                <EmergencyBadge level={registeredPatient.emergencyLevel} score={registeredPatient.priorityScore} />
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-[11px]">Chief Complaint</span>
              <span className="text-slate-300 italic">{registeredPatient.chiefComplaint}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/patients')}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50"
            >
              <span>View in Patient Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-6 py-2.5 rounded-xl text-xs transition-colors"
            >
              Register Another Patient
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              title="Return to Login"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">Patient Intake & Registration</h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hospital Emergency Priority System • Emergency Department Admissions Module
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">Need staff login?</span>
            <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
              Staff Command Center
            </Link>
          </div>
        </div>

        {/* Clinical Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-300">Triage Safety Protocol:</strong> Priority assignment evaluates multi-parameter vital signs and presenting condition. Algorithmic recommendations do not replace licensed healthcare professional judgement.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Personal Information */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                1
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-200">Personal Information</h2>
                <p className="text-[11px] text-slate-400">Demographics, identifiers, and emergency contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Johnathan Doe"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Age <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={125}
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="35"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Gender <span className="text-rose-400">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Non-Binary</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1-555-0199"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="O_POSITIVE">O+ (O Positive)</option>
                  <option value="O_NEGATIVE">O- (O Negative)</option>
                  <option value="A_POSITIVE">A+ (A Positive)</option>
                  <option value="A_NEGATIVE">A- (A Negative)</option>
                  <option value="B_POSITIVE">B+ (B Positive)</option>
                  <option value="B_NEGATIVE">B- (B Negative)</option>
                  <option value="AB_POSITIVE">AB+ (AB Positive)</option>
                  <option value="AB_NEGATIVE">AB- (AB Negative)</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1.5">Residential Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Hospital Drive, Cityville, State 12345"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Emergency Contact */}
              <div className="sm:col-span-3 pt-2 border-t border-slate-800/60">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Emergency Contact Person
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact Name (e.g. Jane Doe)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={emergencyContactRel}
                    onChange={(e) => setEmergencyContactRel(e.target.value)}
                    placeholder="Relationship (e.g. Spouse / Parent)"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Emergency Contact Phone"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Medical Information */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-200">Medical Information</h2>
                <p className="text-[11px] text-slate-400">Chief complaint, active symptoms, allergies, and medical background</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Chief Complaint */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Chief Complaint / Reason for Visit <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Primary acute reason for emergency visit (e.g. Sudden severe left-sided chest pain radiating to shoulder, onset 45 mins ago)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Symptoms & Clinical Manifestations</label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Associated symptoms (e.g. Shortness of breath, dizziness, sweating, nausea, pain score 8/10)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Existing Medical Conditions */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Existing Medical Conditions</label>
                  <input
                    type="text"
                    value={existingConditions}
                    onChange={(e) => setExistingConditions(e.target.value)}
                    placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Allergies (comma-separated)</label>
                  <input
                    type="text"
                    value={allergiesInput}
                    onChange={(e) => setAllergiesInput(e.target.value)}
                    placeholder="e.g. Penicillin, Latex, Peanuts"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Current Medications */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Current Medications</label>
                  <input
                    type="text"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="e.g. Metformin 500mg daily, Lisinopril 10mg"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Medical History */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">Past Surgeries / Medical History</label>
                  <input
                    type="text"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="e.g. Appendectomy 2018, coronary stent 2021"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Emergency Assessment & Vitals */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                  3
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-200">Emergency Assessment & Vital Signs</h2>
                  <p className="text-[11px] text-slate-400">Physiologic parameters and triage category classification</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutoEvaluateTriage}
                disabled={isEvaluatingTriage}
                className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEvaluatingTriage ? 'Evaluating Vitals...' : 'Auto-Evaluate Triage Protocol'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
              {/* Temperature */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="98.6"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="120/80"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Heart Rate */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="75"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Respiratory Rate */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Resp Rate (/min)</label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="16"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* SpO2 */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="98"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              {/* Arrival Time */}
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Arrival Time</label>
                <input
                  type="datetime-local"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-[11px]"
                />
              </div>
            </div>

            {/* Clinical Rationale Box if available */}
            {triageRationale.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs space-y-1.5">
                <p className="font-semibold text-cyan-400 text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Clinical Protocol Multi-Parameter Factors:
                </p>
                <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                  {triageRationale.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                {triageDisclaimer && (
                  <p className="text-[10px] text-slate-500 italic pt-1">{triageDisclaimer}</p>
                )}
              </div>
            )}

            {/* 5 Triage Levels Selection */}
            <div>
              <label className="block text-slate-300 font-medium text-xs mb-2">
                Emergency Priority Category (5 Triage Categories) <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  {
                    level: 'LEVEL_1_RESUSCITATION' as EmergencyLevel,
                    title: 'Level 1 – Resuscitation',
                    subtitle: 'Immediate life-saving care',
                    color: 'border-red-500/60 bg-red-950/40 text-red-300 hover:bg-red-950/70',
                    active: 'ring-2 ring-red-500 bg-red-950 text-red-200',
                  },
                  {
                    level: 'LEVEL_2_EMERGENCY' as EmergencyLevel,
                    title: 'Level 2 – Emergency',
                    subtitle: 'Care within 15 minutes',
                    color: 'border-orange-500/60 bg-orange-950/40 text-orange-300 hover:bg-orange-950/70',
                    active: 'ring-2 ring-orange-500 bg-orange-950 text-orange-200',
                  },
                  {
                    level: 'LEVEL_3_URGENT' as EmergencyLevel,
                    title: 'Level 3 – Urgent',
                    subtitle: 'Care within 30 minutes',
                    color: 'border-amber-500/60 bg-amber-950/40 text-amber-300 hover:bg-amber-950/70',
                    active: 'ring-2 ring-amber-500 bg-amber-950 text-amber-200',
                  },
                  {
                    level: 'LEVEL_4_LESS_URGENT' as EmergencyLevel,
                    title: 'Level 4 – Less Urgent',
                    subtitle: 'Care within 60 minutes',
                    color: 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/70',
                    active: 'ring-2 ring-emerald-500 bg-emerald-950 text-emerald-200',
                  },
                  {
                    level: 'LEVEL_5_NON_URGENT' as EmergencyLevel,
                    title: 'Level 5 – Non-Urgent',
                    subtitle: 'Care within 120 minutes',
                    color: 'border-blue-500/60 bg-blue-950/40 text-blue-300 hover:bg-blue-950/70',
                    active: 'ring-2 ring-blue-500 bg-blue-950 text-blue-200',
                  },
                ].map((item) => {
                  const isSelected = emergencyLevel === item.level;
                  return (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setEmergencyLevel(item.level)}
                      className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                        item.color
                      } ${isSelected ? item.active : 'opacity-80'}`}
                    >
                      <div className="font-bold">{item.title}</div>
                      <div className="text-[10px] opacity-80 mt-1">{item.subtitle}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/patients')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-8 py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/50 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering Patient & Syncing Triage...' : 'Complete Patient Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
