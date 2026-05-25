// ─── Core Multi-Tenancy ───
export interface Tenant {
  id: string;
  name: string;
  industry: string;
  createdAt: string;
}

// ─── Emission Scopes ───
export type EmissionScope = 'scope_1' | 'scope_2' | 'scope_3';

// ─── Data Source Types ───
export type SourceType = 'sap_fuel' | 'sap_procurement' | 'utility_electricity' | 'travel_flights' | 'travel_hotels' | 'travel_ground';

// ─── Row Status in Review Workflow ───
export type RowStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

// ─── Ingestion Batch ───
export interface IngestionBatch {
  id: string;
  tenantId: string;
  sourceType: SourceType;
  fileName: string;
  ingestedAt: string;
  ingestedBy: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  flaggedRows: number;
  status: 'processing' | 'completed' | 'failed';
}

// ─── Normalized Emission Record ───
// This is the canonical shape after normalization from any source.
export interface EmissionRecord {
  id: string;
  batchId: string;
  tenantId: string;
  sourceType: SourceType;
  scope: EmissionScope;
  
  // Temporal
  reportingPeriodStart: string; // ISO date
  reportingPeriodEnd: string;   // ISO date
  
  // Location / Facility
  facilityCode: string;
  facilityName: string;
  country: string;
  
  // Activity data
  activityDescription: string;
  activityCategory: string; // e.g. "diesel_combustion", "electricity_grid", "flight_short_haul"
  
  // Quantity — always normalized
  rawQuantity: number;
  rawUnit: string;           // Original unit from source
  normalizedQuantity: number; // Converted to standard unit
  normalizedUnit: string;     // Standard unit (kWh, liters, km, etc.)
  
  // Emission computation
  emissionFactor: number;     // kgCO2e per unit
  emissionFactorSource: string; // e.g. "DEFRA 2024", "EPA eGRID 2023"
  computedEmissionKgCO2e: number;
  
  // Source-of-truth tracking
  rawSourceData: Record<string, unknown>; // Original row as-is from source
  
  // Review workflow
  status: RowStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  
  // Flags
  flags: DataFlag[];
  
  // Audit trail
  createdAt: string;
  updatedAt: string;
  editHistory: EditEvent[];
}

export interface DataFlag {
  type: 'unit_mismatch' | 'outlier' | 'missing_field' | 'date_anomaly' | 'duplicate_suspect' | 'negative_value' | 'unknown_facility';
  message: string;
  severity: 'warning' | 'error';
  field?: string;
}

export interface EditEvent {
  timestamp: string;
  userId: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

// ─── SAP-Specific Raw Shape ───
// Modeled after SAP IDoc MATDOC / flat-file MB51 export
export interface SAPFuelRow {
  MBLNR: string;          // Material document number
  MJAHR: string;          // Material document year
  ZEILE: string;          // Line item
  BWART: string;          // Movement type (e.g. 261 = goods issue)
  MATNR: string;          // Material number
  MAKTX: string;          // Material description (sometimes German)
  WERKS: string;          // Plant code
  LGORT: string;          // Storage location
  MENGE: string;          // Quantity (inconsistent decimals)
  MEINS: string;          // Unit (L, KG, GAL, TO, etc.)
  BUDAT: string;          // Posting date (YYYYMMDD or DD.MM.YYYY)
  KOSTL: string;          // Cost center
  SGTXT: string;          // Item text
  WAERS: string;          // Currency
  DMBTR: string;          // Amount in local currency
}

// ─── Utility CSV Raw Shape ───
// Modeled after typical utility portal CSV exports (e.g. Duke Energy, ConEd)
export interface UtilityRow {
  account_number: string;
  meter_id: string;
  service_address: string;
  billing_period_start: string; // MM/DD/YYYY
  billing_period_end: string;
  read_date: string;
  meter_read_previous: string;
  meter_read_current: string;
  usage_kwh: string;
  demand_kw: string;
  tariff_code: string;
  total_charges: string;
  currency: string;
}

// ─── Travel Platform Raw Shape ───
// Modeled after Concur v3 API / SAP Concur expense report extract
export interface TravelRow {
  report_id: string;
  entry_id: string;
  expense_type: string;     // AIRFR, HOTEL, CARRT, TRAIN, TAXI
  transaction_date: string;  // YYYY-MM-DD
  vendor_name: string;
  description: string;
  origin_city: string;
  destination_city: string;
  origin_iata: string;      // Airport code (flights)
  destination_iata: string;
  cabin_class: string;       // ECONOMY, BUSINESS, FIRST
  distance_km: string;       // May be empty
  nights: string;            // Hotels only
  amount: string;
  currency: string;
  employee_id: string;
  cost_center: string;
}

// ─── Dashboard Metrics ───
export interface DashboardMetrics {
  totalBatches: number;
  totalRecords: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  flagged: number;
  totalEmissionsKgCO2e: number;
  byScope: Record<EmissionScope, number>;
  bySource: Record<SourceType, number>;
}

// ─── Airport Lookup (for distance calculation) ───
export interface Airport {
  iata: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
}

// ─── Plant Code Lookup ───
export interface PlantCodeMapping {
  code: string;
  name: string;
  country: string;
  region: string;
}
