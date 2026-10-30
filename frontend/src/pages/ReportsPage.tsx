import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { StatCard } from '../components/ui/StatCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  Stethoscope,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('daily');

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', reportType],
    queryFn: () => reportService.getReport(reportType),
  });

  const handleExportCsv = async () => {
    try {
      const blob = await reportService.downloadCsv(reportType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `emergency_report_${reportType}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('CSV Report exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Emergency Operations Analytics & Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate performance indicators, critical intake statistics, and operational wait time reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Report Type Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {['daily', 'weekly', 'monthly'].map((t) => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  reportType === t
                    ? 'bg-cyan-600 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading || !report ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Emergency Cases" value={report.totalCases} icon={FileText} variant="default" />
            <StatCard title="Critical (P1) Cases" value={report.criticalCases} icon={AlertCircle} variant="critical" />
            <StatCard title="Avg Triage Wait Time" value={`${report.averageWaitTimeMinutes}m`} icon={Clock} variant="cyan" />
            <StatCard title="Completed Cases" value={report.completedCases} icon={CheckCircle2} variant="emerald" />
          </div>

          {/* Breakdown Table Card */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">
              {report.reportType} Triage Breakdown Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block mb-2">Priority Level Counts</span>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-red-400 font-semibold">Critical (P1):</span>
                  <span className="font-mono font-bold text-slate-200">{report.criticalCases}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-amber-400 font-semibold">High Priority (P2):</span>
                  <span className="font-mono font-bold text-slate-200">{report.highCases}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-emerald-400 font-semibold">Medium Priority (P3):</span>
                  <span className="font-mono font-bold text-slate-200">{report.mediumCases}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-blue-400 font-semibold">Low Priority (P4):</span>
                  <span className="font-mono font-bold text-slate-200">{report.lowCases}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block mb-2">Hospital Capacity Totals</span>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Registered Patients:</span>
                  <span className="font-mono font-bold text-slate-200">{report.totalPatientsRegistered}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Physicians in System:</span>
                  <span className="font-mono font-bold text-slate-200">{report.totalDoctorsInSystem}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Cancelled / Diverted Cases:</span>
                  <span className="font-mono font-bold text-slate-200">{report.cancelledCases}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
