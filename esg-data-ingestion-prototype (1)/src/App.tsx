import { useState, useMemo } from 'react';
import { useAppStore } from './store/useStore';
import { MetricsPanel } from './components/MetricsPanel';
import { BatchList } from './components/BatchList';
import { ReviewTable } from './components/ReviewTable';
import { IngestionPanel } from './components/IngestionPanel';
import { EmissionsChart } from './components/EmissionsChart';
import {
  LayoutDashboard,
  ClipboardCheck,
  Upload,
  Leaf,
  ChevronRight,
  User,
  Building2,
} from 'lucide-react';

type View = 'dashboard' | 'review' | 'ingest';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const { records, batches, updateRecordStatus, bulkUpdateStatus, getMetrics } = useAppStore();
  
  const metrics = useMemo(() => getMetrics(), [getMetrics, records]);
  
  const navItems: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'review', label: 'Review & Approve', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'ingest', label: 'Data Ingestion', icon: <Upload className="w-4 h-4" /> },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800">
                  Breathe<span className="text-emerald-600">ESG</span>
                </span>
              </div>
              <span className="hidden sm:block text-xs text-gray-400 border-l border-gray-200 pl-3 ml-1">
                Data Ingestion & Review Platform
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                <Building2 className="w-3.5 h-3.5" />
                <span>Tata Industries</span>
                <ChevronRight className="w-3 h-3" />
                <span className="font-medium text-gray-700">FY 2024-25 Q1</span>
              </div>
              <div className="flex items-center gap-2 pl-4 border-l border-gray-100">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-gray-700">Sairam</p>
                  <p className="text-xs text-gray-400">ESG Analyst</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tab nav */}
          <nav className="flex items-center gap-1 -mb-px">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  view === item.key
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Overview</h1>
              <p className="text-sm text-gray-500 mt-1">
                Emissions data from 3 sources across {batches.length} ingestion batches.
                {metrics.pendingReview > 0 && (
                  <button
                    onClick={() => setView('review')}
                    className="ml-2 text-emerald-600 font-medium hover:underline"
                  >
                    {metrics.pendingReview} records pending review →
                  </button>
                )}
              </p>
            </div>
            
            <MetricsPanel metrics={metrics} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EmissionsChart records={records} />
              </div>
              <div>
                <BatchList
                  batches={batches}
                  selectedBatchId={selectedBatchId}
                  onSelectBatch={(id) => {
                    setSelectedBatchId(id);
                    if (id) setView('review');
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {view === 'review' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-800">Review & Approve</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Review normalized emission records. Approved rows are locked for audit.
                  {selectedBatchId && (
                    <button
                      onClick={() => setSelectedBatchId(null)}
                      className="ml-2 text-blue-600 font-medium hover:underline"
                    >
                      Clear batch filter ×
                    </button>
                  )}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-1 space-y-4">
                <BatchList
                  batches={batches}
                  selectedBatchId={selectedBatchId}
                  onSelectBatch={setSelectedBatchId}
                />
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Review Progress</h4>
                  <div className="space-y-2">
                    {(['pending', 'flagged', 'approved', 'rejected'] as const).map(status => {
                      const count = records.filter(r => r.status === status).length;
                      const pct = records.length > 0 ? (count / records.length) * 100 : 0;
                      const colors: Record<string, string> = {
                        pending: 'bg-amber-400',
                        flagged: 'bg-orange-400',
                        approved: 'bg-emerald-400',
                        rejected: 'bg-red-400',
                      };
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-gray-600">{status}</span>
                            <span className="text-gray-400">{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors[status]} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="xl:col-span-3">
                <ReviewTable
                  records={records}
                  batchFilter={selectedBatchId}
                  onUpdateStatus={updateRecordStatus}
                  onBulkUpdate={bulkUpdateStatus}
                />
              </div>
            </div>
          </div>
        )}
        
        {view === 'ingest' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Data Ingestion</h1>
              <p className="text-sm text-gray-500 mt-1">
                Upload emission data from SAP, utility portals, or travel platforms.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IngestionPanel />
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Ingestion Architecture — India Context</h3>
                  <div className="space-y-4 text-xs text-gray-600">
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">1. SAP — Fuel & Procurement (Scope 1)</p>
                      <p>
                        <span className="font-medium">Format chosen:</span> MB51 pipe-delimited flat file export.
                        We chose this over IDoc (too complex for a prototype) and OData (requires SAP Gateway configuration).
                        The flat file is the format most SAP admins in Indian enterprises can produce without middleware.
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Key challenges:</span> Hindi/Devanagari descriptions, DD.MM.YYYY dates, 
                        KL→L (kiloliter) conversion, plant codes requiring lookup table (Jamshedpur, Pune, Chennai, etc.), 
                        movement type 201 vs 261 filtering, negative quantities (reversals), furnace oil categorization.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">2. Utility — Electricity from DISCOMs (Scope 2)</p>
                      <p>
                        <span className="font-medium">Format chosen:</span> CSV export from state DISCOM web portals (MSEDCL, TATA Power, CESC, BESCOM, TANGEDCO).
                        We chose this over PDF bills (requires OCR, error-prone) and utility APIs (Indian DISCOMs rarely offer them).
                        CSV download from consumer portal is the standard practice for facilities teams.
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Key challenges:</span> Different DISCOMs have different formats, 
                        HT (High Tension) vs LT connections, demand in kVA, regional grid emission factors 
                        (CEA India 2023 — North/South/East/West regions have different factors), multiple meters per facility.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">3. Travel — Concur/ITILITE (Scope 3)</p>
                      <p>
                        <span className="font-medium">Format chosen:</span> SAP Concur Standard Accounting Extract (SAE) as CSV.
                        For Indian enterprises, also compatible with ITILITE and Zaggle exports.
                        Travel includes domestic flights (IndiGo, Vistara, SpiceJet), Indian Railways (Rajdhani, Shatabdi), and Ola/Uber.
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Key challenges:</span> Missing IATA codes for domestic routes, 
                        Indian Railways distance calculation, cabin class emission factors, 
                        same origin/destination errors, zero-night hotel stays.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Emission Factor Sources — India</h3>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p><span className="font-medium text-blue-600">Scope 1:</span> IPCC 2006 / India GHG Program — HSD, MS, LPG, PNG, Furnace Oil</p>
                    <p><span className="font-medium text-violet-600">Scope 2:</span> CEA India CO2 Database 2023 — Regional Grid Factors (North: 0.85, South: 0.78, West: 0.80, East: 0.88 kgCO₂e/kWh)</p>
                    <p><span className="font-medium text-cyan-600">Scope 3:</span> DEFRA 2024 + Indian Railways Sustainability Report 2023 — Flights, Hotels, Rail, Taxi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <p>Breathe ESG — Data Ingestion Prototype</p>
          <p>Tenant: Tata Industries · Reporting Period: FY 2024-25 Q1</p>
        </div>
      </footer>
    </div>
  );
}
