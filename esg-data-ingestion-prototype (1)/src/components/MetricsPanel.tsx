import type { DashboardMetrics } from '../types';
import {
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';

function formatKg(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tCO₂e`;
  }
  return `${kg.toFixed(0)} kgCO₂e`;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function MetricCard({ label, value, icon, color, subtitle }: MetricCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '50').replace('700', '50').replace('800', '50')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function MetricsPanel({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <MetricCard
          label="Total Records"
          value={metrics.totalRecords}
          icon={<Layers className="w-5 h-5 text-gray-600" />}
          color="text-gray-800"
          subtitle={`${metrics.totalBatches} batches`}
        />
        <MetricCard
          label="Pending Review"
          value={metrics.pendingReview}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="text-amber-600"
        />
        <MetricCard
          label="Flagged"
          value={metrics.flagged}
          icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          color="text-orange-600"
        />
        <MetricCard
          label="Approved"
          value={metrics.approved}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          color="text-emerald-600"
        />
        <MetricCard
          label="Rejected"
          value={metrics.rejected}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="text-red-600"
        />
        <MetricCard
          label="Total Emissions"
          value={formatKg(metrics.totalEmissionsKgCO2e)}
          icon={<FileCheck className="w-5 h-5 text-blue-600" />}
          color="text-blue-700"
          subtitle="(excl. rejected)"
        />
      </div>
      
      {/* Scope breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-sm font-semibold text-blue-800">Scope 1 — Direct</span>
          </div>
          <p className="text-xl font-bold text-blue-700">{formatKg(metrics.byScope.scope_1)}</p>
          <p className="text-xs text-blue-400 mt-1">Fuel combustion (SAP)</p>
        </div>
        <div className="bg-white rounded-xl border border-violet-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-violet-500"></span>
            <span className="text-sm font-semibold text-violet-800">Scope 2 — Indirect</span>
          </div>
          <p className="text-xl font-bold text-violet-700">{formatKg(metrics.byScope.scope_2)}</p>
          <p className="text-xs text-violet-400 mt-1">Purchased electricity</p>
        </div>
        <div className="bg-white rounded-xl border border-cyan-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
            <span className="text-sm font-semibold text-cyan-800">Scope 3 — Value Chain</span>
          </div>
          <p className="text-xl font-bold text-cyan-700">{formatKg(metrics.byScope.scope_3)}</p>
          <p className="text-xs text-cyan-400 mt-1">Business travel</p>
        </div>
      </div>
    </div>
  );
}
