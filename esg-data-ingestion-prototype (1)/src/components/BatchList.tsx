import type { IngestionBatch } from '../types';
import { SourceBadge } from './StatusBadge';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const SOURCE_LABELS: Record<string, string> = {
  sap_fuel: 'SAP — Fuel & Procurement',
  utility_electricity: 'Utility — Electricity',
  travel_flights: 'Travel — Concur Extract',
};

interface BatchListProps {
  batches: IngestionBatch[];
  selectedBatchId: string | null;
  onSelectBatch: (id: string | null) => void;
}

export function BatchList({ batches, selectedBatchId, onSelectBatch }: BatchListProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Ingestion Batches
        </h3>
      </div>
      <div className="divide-y divide-gray-50">
        {batches.map(batch => (
          <button
            key={batch.id}
            onClick={() => onSelectBatch(selectedBatchId === batch.id ? null : batch.id)}
            className={`w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors ${
              selectedBatchId === batch.id ? 'bg-blue-50 border-l-3 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 truncate max-w-[250px]">
                  {batch.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <SourceBadge sourceType={batch.sourceType} />
                  <span className="text-xs text-gray-400">
                    {SOURCE_LABELS[batch.sourceType] || batch.sourceType}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {batch.status === 'completed' ? (
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Clock className="w-3 h-3 text-amber-500" />
                  )}
                  {batch.status}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{batch.totalRows} rows</span>
              <span className="text-emerald-600">{batch.validRows} valid</span>
              {batch.errorRows > 0 && (
                <span className="text-red-500 flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  {batch.errorRows} errors
                </span>
              )}
              {batch.flaggedRows > 0 && (
                <span className="text-amber-500">{batch.flaggedRows} flagged</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(batch.ingestedAt).toLocaleString()} by {batch.ingestedBy}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
