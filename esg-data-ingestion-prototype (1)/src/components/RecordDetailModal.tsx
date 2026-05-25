import type { EmissionRecord } from '../types';
import { StatusBadge, ScopeBadge, SourceBadge, FlagBadge } from './StatusBadge';
import { X, History, Database, Zap, AlertTriangle } from 'lucide-react';

interface RecordDetailModalProps {
  record: EmissionRecord;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'number') return v.toLocaleString();
  return String(v);
}

export function RecordDetailModal({ record, onClose, onApprove, onReject, onFlag }: RecordDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Record Detail</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {record.id.substring(0, 8)}…</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Status + Actions */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={record.status} />
            <ScopeBadge scope={record.scope} />
            <SourceBadge sourceType={record.sourceType} />
          </div>
          {record.status !== 'approved' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onApprove}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                ✓ Approve
              </button>
              <button
                onClick={onReject}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                ✕ Reject
              </button>
              {record.status !== 'flagged' && (
                <button
                  onClick={onFlag}
                  className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  ⚑ Flag
                </button>
              )}
            </div>
          )}
          {record.status === 'approved' && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              🔒 Locked for audit
            </div>
          )}
        </div>
        
        {/* Flags */}
        {record.flags.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Data Quality Flags</span>
            </div>
            <div className="space-y-1.5">
              {record.flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2">
                  <FlagBadge severity={flag.severity} />
                  <span className="text-sm text-amber-700">{flag.message}</span>
                  {flag.field && (
                    <span className="text-xs text-amber-400 font-mono">({flag.field})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Normalized Data */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-700">Normalized Data</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              ['Facility', `${record.facilityName} (${record.facilityCode})`],
              ['Country', record.country],
              ['Activity', record.activityDescription],
              ['Category', record.activityCategory],
              ['Period', `${record.reportingPeriodStart} — ${record.reportingPeriodEnd}`],
              ['Raw Qty', `${record.rawQuantity.toLocaleString()} ${record.rawUnit}`],
              ['Normalized Qty', `${record.normalizedQuantity.toLocaleString()} ${record.normalizedUnit}`],
              ['Emission Factor', `${record.emissionFactor} kgCO₂e/${record.normalizedUnit}`],
              ['Factor Source', record.emissionFactorSource],
              ['Emissions', `${record.computedEmissionKgCO2e.toFixed(2)} kgCO₂e`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-xs text-gray-500 font-medium">{label}</span>
                <span className="text-xs text-gray-800 text-right max-w-[200px] truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Raw Source Data */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Raw Source Data</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
            <table className="text-xs w-full">
              <tbody>
                {Object.entries(record.rawSourceData).map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 pr-4 font-mono text-gray-500 whitespace-nowrap">{key}</td>
                    <td className="py-1.5 text-gray-800">{formatValue(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Audit Trail */}
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Audit Trail</h3>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Created: {new Date(record.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(record.updatedAt).toLocaleString()}</p>
            {record.reviewedBy && (
              <p>Reviewed by: {record.reviewedBy} at {record.reviewedAt ? new Date(record.reviewedAt).toLocaleString() : '—'}</p>
            )}
            {record.reviewNotes && (
              <p className="mt-1 bg-gray-50 p-2 rounded">Notes: {record.reviewNotes}</p>
            )}
          </div>
          {record.editHistory.length > 0 && (
            <div className="mt-3 space-y-2">
              {record.editHistory.map((ev, i) => (
                <div key={i} className="text-xs bg-gray-50 p-2 rounded flex items-start gap-2">
                  <History className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-600">{ev.userId}</span>
                    <span className="text-gray-400"> changed </span>
                    <span className="font-mono text-gray-600">{ev.field}</span>
                    <span className="text-gray-400"> from </span>
                    <span className="text-red-500">{ev.oldValue}</span>
                    <span className="text-gray-400"> to </span>
                    <span className="text-emerald-600">{ev.newValue}</span>
                    <span className="text-gray-400"> — {new Date(ev.timestamp).toLocaleString()}</span>
                    {ev.reason && <p className="text-gray-400 mt-0.5">Reason: {ev.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
