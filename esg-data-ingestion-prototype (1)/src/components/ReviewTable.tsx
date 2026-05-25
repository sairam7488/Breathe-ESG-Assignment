import { useState, useMemo } from 'react';
import type { EmissionRecord, RowStatus, SourceType, EmissionScope } from '../types';
import { StatusBadge, ScopeBadge, SourceBadge } from './StatusBadge';
import { RecordDetailModal } from './RecordDetailModal';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  Eye,
} from 'lucide-react';

interface ReviewTableProps {
  records: EmissionRecord[];
  batchFilter: string | null;
  onUpdateStatus: (id: string, status: RowStatus, notes?: string) => void;
  onBulkUpdate: (ids: string[], status: RowStatus, notes?: string) => void;
}

type SortField = 'date' | 'emissions' | 'status' | 'scope' | 'source';
type SortDir = 'asc' | 'desc';

export function ReviewTable({ records, batchFilter, onUpdateStatus, onBulkUpdate }: ReviewTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RowStatus | 'all'>('all');
  const [scopeFilter, setScopeFilter] = useState<EmissionScope | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceType | 'all'>('all');
  const [flagsOnly, setFlagsOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailRecord, setDetailRecord] = useState<EmissionRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const filtered = useMemo(() => {
    let data = [...records];
    
    if (batchFilter) {
      data = data.filter(r => r.batchId === batchFilter);
    }
    
    if (statusFilter !== 'all') {
      data = data.filter(r => r.status === statusFilter);
    }
    
    if (scopeFilter !== 'all') {
      data = data.filter(r => r.scope === scopeFilter);
    }
    
    if (sourceFilter !== 'all') {
      data = data.filter(r => r.sourceType === sourceFilter);
    }
    
    if (flagsOnly) {
      data = data.filter(r => r.flags.length > 0);
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        r.activityDescription.toLowerCase().includes(q) ||
        r.facilityName.toLowerCase().includes(q) ||
        r.facilityCode.toLowerCase().includes(q) ||
        r.activityCategory.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q)
      );
    }
    
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = a.reportingPeriodStart.localeCompare(b.reportingPeriodStart);
          break;
        case 'emissions':
          cmp = a.computedEmissionKgCO2e - b.computedEmissionKgCO2e;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'scope':
          cmp = a.scope.localeCompare(b.scope);
          break;
        case 'source':
          cmp = a.sourceType.localeCompare(b.sourceType);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return data;
  }, [records, batchFilter, statusFilter, scopeFilter, sourceFilter, flagsOnly, search, sortField, sortDir]);
  
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };
  
  const SortIcon = ({ field }: { field: SortField }) => (
    sortField === field ? (
      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : <ChevronDown className="w-3 h-3 opacity-30" />
  );
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  
  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(r => r.id)));
    }
  };
  
  const bulkAction = (status: RowStatus) => {
    const ids = Array.from(selectedIds);
    onBulkUpdate(ids, status, `Bulk ${status}`);
    setSelectedIds(new Set());
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-gray-100 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search records…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedIds.size} selected</span>
              <button
                onClick={() => bulkAction('approved')}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Approve All
              </button>
              <button
                onClick={() => bulkAction('rejected')}
                className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Reject All
              </button>
            </div>
          )}
        </div>
        
        {showFilters && (
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as RowStatus | 'all')}
              className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={scopeFilter}
              onChange={e => setScopeFilter(e.target.value as EmissionScope | 'all')}
              className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Scopes</option>
              <option value="scope_1">Scope 1</option>
              <option value="scope_2">Scope 2</option>
              <option value="scope_3">Scope 3</option>
            </select>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value as SourceType | 'all')}
              className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
            >
              <option value="all">All Sources</option>
              <option value="sap_fuel">SAP Fuel</option>
              <option value="utility_electricity">Utility</option>
              <option value="travel_flights">Flights</option>
              <option value="travel_hotels">Hotels</option>
              <option value="travel_ground">Ground</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={flagsOnly}
                onChange={e => setFlagsOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              Flagged only
            </label>
            <span className="text-xs text-gray-400 ml-auto">
              {filtered.length} of {records.length} records
            </span>
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="pl-5 py-3 w-10">
                <button onClick={selectAll} className="text-gray-400 hover:text-gray-600">
                  {selectedIds.size === filtered.length && filtered.length > 0 ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('scope')}>
                <span className="flex items-center gap-1">Scope <SortIcon field="scope" /></span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('source')}>
                <span className="flex items-center gap-1">Source <SortIcon field="source" /></span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('date')}>
                <span className="flex items-center gap-1">Period <SortIcon field="date" /></span>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Facility
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => toggleSort('emissions')}>
                <span className="flex items-center gap-1 justify-end">kgCO₂e <SortIcon field="emissions" /></span>
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Flags
              </th>
              <th className="pr-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(record => (
              <tr
                key={record.id}
                className={`hover:bg-gray-50 transition-colors ${
                  record.status === 'approved' ? 'opacity-60' : ''
                } ${selectedIds.has(record.id) ? 'bg-blue-50' : ''}`}
              >
                <td className="pl-5 py-2.5">
                  <button onClick={() => toggleSelect(record.id)} className="text-gray-400 hover:text-gray-600">
                    {selectedIds.has(record.id) ? (
                      <CheckSquare className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-3 py-2.5">
                  <ScopeBadge scope={record.scope} />
                </td>
                <td className="px-3 py-2.5">
                  <SourceBadge sourceType={record.sourceType} />
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                  {record.reportingPeriodStart}
                  {record.reportingPeriodStart !== record.reportingPeriodEnd && (
                    <> → {record.reportingPeriodEnd}</>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <p className="text-xs text-gray-700 truncate max-w-[250px]">{record.activityDescription}</p>
                  <p className="text-xs text-gray-400 font-mono">{record.activityCategory}</p>
                </td>
                <td className="px-3 py-2.5">
                  <p className="text-xs text-gray-700 truncate max-w-[180px]">{record.facilityName}</p>
                  <p className="text-xs text-gray-400">{record.country}</p>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`text-sm font-mono font-medium ${
                    record.computedEmissionKgCO2e > 5000 ? 'text-red-600' :
                    record.computedEmissionKgCO2e > 1000 ? 'text-amber-600' :
                    'text-gray-700'
                  }`}>
                    {record.computedEmissionKgCO2e.toFixed(1)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {record.flags.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <AlertTriangle className={`w-3.5 h-3.5 ${
                        record.flags.some(f => f.severity === 'error') ? 'text-red-500' : 'text-amber-500'
                      }`} />
                      <span className="text-gray-500">{record.flags.length}</span>
                    </span>
                  )}
                </td>
                <td className="pr-5 py-2.5">
                  <button
                    onClick={() => setDetailRecord(record)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-blue-600"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center text-gray-400">
                  No records match current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Detail Modal */}
      {detailRecord && (
        <RecordDetailModal
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
          onApprove={() => {
            onUpdateStatus(detailRecord.id, 'approved', 'Approved upon review');
            setDetailRecord(prev => prev ? { ...prev, status: 'approved' as const } : null);
          }}
          onReject={() => {
            onUpdateStatus(detailRecord.id, 'rejected', 'Rejected — data quality issue');
            setDetailRecord(prev => prev ? { ...prev, status: 'rejected' as const } : null);
          }}
          onFlag={() => {
            onUpdateStatus(detailRecord.id, 'flagged', 'Flagged for further review');
            setDetailRecord(prev => prev ? { ...prev, status: 'flagged' as const } : null);
          }}
        />
      )}
    </div>
  );
}
