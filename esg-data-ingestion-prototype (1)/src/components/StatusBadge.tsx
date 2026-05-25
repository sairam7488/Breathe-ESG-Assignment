import type { RowStatus } from '../types';

const STATUS_STYLES: Record<RowStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  flagged: 'bg-orange-100 text-orange-800 border-orange-200',
};

const STATUS_LABELS: Record<RowStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  flagged: 'Flagged',
};

export function StatusBadge({ status }: { status: RowStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ScopeBadge({ scope }: { scope: string }) {
  const styles: Record<string, string> = {
    scope_1: 'bg-blue-100 text-blue-800 border-blue-200',
    scope_2: 'bg-violet-100 text-violet-800 border-violet-200',
    scope_3: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  };
  const labels: Record<string, string> = {
    scope_1: 'Scope 1',
    scope_2: 'Scope 2',
    scope_3: 'Scope 3',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[scope] || 'bg-gray-100 text-gray-800'}`}>
      {labels[scope] || scope}
    </span>
  );
}

export function SourceBadge({ sourceType }: { sourceType: string }) {
  const labels: Record<string, string> = {
    sap_fuel: 'SAP Fuel',
    sap_procurement: 'SAP Procurement',
    utility_electricity: 'Utility',
    travel_flights: 'Flights',
    travel_hotels: 'Hotels',
    travel_ground: 'Ground Transport',
  };
  const styles: Record<string, string> = {
    sap_fuel: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sap_procurement: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    utility_electricity: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    travel_flights: 'bg-sky-50 text-sky-700 border-sky-200',
    travel_hotels: 'bg-pink-50 text-pink-700 border-pink-200',
    travel_ground: 'bg-teal-50 text-teal-700 border-teal-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[sourceType] || 'bg-gray-50 text-gray-700'}`}>
      {labels[sourceType] || sourceType}
    </span>
  );
}

export function FlagBadge({ severity }: { severity: 'warning' | 'error' }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
      severity === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
    }`}>
      {severity === 'error' ? '⛔' : '⚠️'} {severity}
    </span>
  );
}
