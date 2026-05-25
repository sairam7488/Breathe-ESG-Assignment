import { v4 as uuidv4 } from 'uuid';
import type {
  EmissionRecord,
  SAPFuelRow,
  UtilityRow,
  TravelRow,
  DataFlag,
  SourceType,
} from '../types';
import { lookupPlant } from '../data/plantCodes';
import { calculateDistanceKm, getFlightCategory } from '../data/airports';
import { getEmissionFactor } from '../data/emissionFactors';

const TENANT_ID = 'tenant-tata-industries';
const KL_TO_LITERS = 1000; // Kiloliter to liters

// ─── Unit Conversion Helpers ───

function parseSAPDate(dateStr: string): { start: string; end: string } {
  let d: Date;
  
  // Check for DD.MM.YYYY format
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      d = new Date(dateStr);
    }
  } else if (dateStr.length === 8) {
    // YYYYMMDD format
    d = new Date(
      parseInt(dateStr.substring(0, 4)),
      parseInt(dateStr.substring(4, 6)) - 1,
      parseInt(dateStr.substring(6, 8))
    );
  } else {
    d = new Date(dateStr);
  }
  
  const iso = d.toISOString().split('T')[0];
  return { start: iso, end: iso }; // Single-day transaction
}

function categorizeFuel(description: string): { category: string; scope: 'scope_1' } {
  const desc = description.toLowerCase();
  if (desc.includes('diesel') || desc.includes('hsd') || desc.includes('डीजल')) {
    return { category: 'diesel_combustion', scope: 'scope_1' };
  }
  if (desc.includes('petrol') || desc.includes('gasoline') || desc.includes('ms ')) {
    return { category: 'petrol_combustion', scope: 'scope_1' };
  }
  if (desc.includes('natural gas') || desc.includes('png') || desc.includes('cng')) {
    return { category: 'natural_gas_combustion', scope: 'scope_1' };
  }
  if (desc.includes('lpg') || desc.includes('autogas')) {
    return { category: 'lpg_combustion', scope: 'scope_1' };
  }
  if (desc.includes('furnace oil') || desc.includes('fo ')) {
    return { category: 'furnace_oil_combustion', scope: 'scope_1' };
  }
  if (desc.includes('fuel oil') || desc.includes('hfo')) {
    return { category: 'fuel_oil_combustion', scope: 'scope_1' };
  }
  return { category: 'diesel_combustion', scope: 'scope_1' }; // Default fallback
}

function getElectricityCategory(region: string): string {
  const r = region.toLowerCase();
  if (r.includes('north') || r.includes('delhi') || r.includes('up ') || r.includes('punjab')) {
    return 'electricity_grid_india_north';
  }
  if (r.includes('south') || r.includes('chennai') || r.includes('bangalore') || r.includes('kerala') || r.includes('tamil')) {
    return 'electricity_grid_india_south';
  }
  if (r.includes('west') || r.includes('mumbai') || r.includes('pune') || r.includes('gujarat') || r.includes('maharashtra')) {
    return 'electricity_grid_india_west';
  }
  if (r.includes('east') || r.includes('kolkata') || r.includes('jamshedpur') || r.includes('odisha') || r.includes('bengal')) {
    return 'electricity_grid_india_east';
  }
  return 'electricity_grid_india';
}

function inferRegionFromAddress(address: string): string {
  const addr = address.toLowerCase();
  if (addr.includes('mumbai') || addr.includes('pune') || addr.includes('maharashtra') || addr.includes('gujarat') || addr.includes('ahmedabad')) {
    return 'West India';
  }
  if (addr.includes('delhi') || addr.includes('ncr') || addr.includes('noida') || addr.includes('gurgaon') || addr.includes('punjab')) {
    return 'North India';
  }
  if (addr.includes('chennai') || addr.includes('bangalore') || addr.includes('hyderabad') || addr.includes('kerala') || addr.includes('tamil')) {
    return 'South India';
  }
  if (addr.includes('kolkata') || addr.includes('jamshedpur') || addr.includes('odisha') || addr.includes('bengal') || addr.includes('jharkhand')) {
    return 'East India';
  }
  return 'India';
}

// ─── SAP Fuel/Procurement Normalization ───

export function normalizeSAPData(rows: SAPFuelRow[], batchId: string): EmissionRecord[] {
  const now = new Date().toISOString();
  
  return rows.map(row => {
    const flags: DataFlag[] = [];
    const plant = lookupPlant(row.WERKS);
    
    // Parse quantity
    let qty = parseFloat(row.MENGE.replace(',', ''));
    
    // Unit normalization
    let normalizedQty = qty;
    let normalizedUnit = row.MEINS;
    
    if (row.MEINS === 'KL') {
      // Kiloliters to liters
      normalizedQty = qty * KL_TO_LITERS;
      normalizedUnit = 'L';
    } else if (row.MEINS === 'M3') {
      normalizedUnit = 'm³';
    } else if (row.MEINS === 'L') {
      normalizedUnit = 'L';
    }
    
    // Flag checks
    if (!plant) {
      flags.push({
        type: 'unknown_facility',
        message: `Unknown plant code: ${row.WERKS}. Requires manual mapping.`,
        severity: 'warning',
        field: 'WERKS',
      });
    }
    
    if (qty < 0) {
      flags.push({
        type: 'negative_value',
        message: `Negative quantity (${qty}). May be a reversal/return. Verify before approval.`,
        severity: 'warning',
        field: 'MENGE',
      });
    }
    
    if (row.BWART !== '261') {
      flags.push({
        type: 'unit_mismatch',
        message: `Movement type ${row.BWART} is not standard fuel consumption (261). Row may not represent fuel usage.`,
        severity: 'error',
        field: 'BWART',
      });
    }
    
    // Check for Hindi text
    if (/[\u0900-\u097F]/.test(row.MAKTX) || /[\u0900-\u097F]/.test(row.SGTXT)) {
      flags.push({
        type: 'missing_field',
        message: 'Row contains Hindi/Devanagari text. Translation may be needed for audit clarity.',
        severity: 'warning',
        field: 'MAKTX',
      });
    }
    
    const { category, scope } = categorizeFuel(row.MAKTX);
    const ef = getEmissionFactor(category);
    const emissionKg = ef ? Math.abs(normalizedQty) * ef.factor : 0;
    
    const dates = parseSAPDate(row.BUDAT);
    
    const sourceType: SourceType = 'sap_fuel';
    
    return {
      id: uuidv4(),
      batchId,
      tenantId: TENANT_ID,
      sourceType,
      scope,
      reportingPeriodStart: dates.start,
      reportingPeriodEnd: dates.end,
      facilityCode: row.WERKS,
      facilityName: plant?.name || `Unknown (${row.WERKS})`,
      country: plant?.country || 'IN',
      activityDescription: `${row.MAKTX} — ${row.SGTXT}`,
      activityCategory: category,
      rawQuantity: qty,
      rawUnit: row.MEINS,
      normalizedQuantity: normalizedQty,
      normalizedUnit,
      emissionFactor: ef?.factor || 0,
      emissionFactorSource: ef?.source || 'Unknown',
      computedEmissionKgCO2e: emissionKg,
      rawSourceData: { ...row } as unknown as Record<string, unknown>,
      status: flags.some(f => f.severity === 'error') ? 'flagged' : 'pending',
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      flags,
      createdAt: now,
      updatedAt: now,
      editHistory: [],
    };
  });
}

// ─── Utility Electricity Normalization ───

export function normalizeUtilityData(rows: UtilityRow[], batchId: string): EmissionRecord[] {
  const now = new Date().toISOString();
  
  return rows.map(row => {
    const flags: DataFlag[] = [];
    
    const usageKwh = row.usage_kwh ? parseFloat(row.usage_kwh) : 0;
    
    // Date validation (DD/MM/YYYY format for India)
    const startParts = row.billing_period_start.split('/');
    const endParts = row.billing_period_end.split('/');
    
    const startDate = new Date(parseInt(startParts[2]), parseInt(startParts[1]) - 1, parseInt(startParts[0]));
    const endDate = new Date(parseInt(endParts[2]), parseInt(endParts[1]) - 1, parseInt(endParts[0]));
    
    if (startDate > endDate) {
      flags.push({
        type: 'date_anomaly',
        message: `Billing period start (${row.billing_period_start}) is after end (${row.billing_period_end}). Dates may be swapped.`,
        severity: 'error',
        field: 'billing_period_start',
      });
    }
    
    if (!row.usage_kwh || usageKwh === 0) {
      flags.push({
        type: 'missing_field',
        message: 'Usage (kWh) is empty or zero. Meter may not have been read or plant shutdown.',
        severity: 'warning',
        field: 'usage_kwh',
      });
    }
    
    // Outlier detection: flag if usage > 3x typical for same meter
    // Simplified: flag anything > 50,000 kWh for a single meter/month (higher for Indian industrial)
    if (usageKwh > 50000) {
      flags.push({
        type: 'outlier',
        message: `Usage of ${usageKwh.toLocaleString('en-IN')} kWh is unusually high. Verify meter read or check for captive power failure.`,
        severity: 'warning',
        field: 'usage_kwh',
      });
    }
    
    const region = inferRegionFromAddress(row.service_address);
    const category = getElectricityCategory(region);
    const ef = getEmissionFactor(category);
    const emissionKg = ef ? usageKwh * ef.factor : 0;
    
    const sourceType: SourceType = 'utility_electricity';
    
    return {
      id: uuidv4(),
      batchId,
      tenantId: TENANT_ID,
      sourceType,
      scope: 'scope_2' as const,
      reportingPeriodStart: startDate.toISOString().split('T')[0],
      reportingPeriodEnd: endDate.toISOString().split('T')[0],
      facilityCode: row.meter_id,
      facilityName: row.service_address,
      country: 'IN',
      activityDescription: `Electricity consumption — Meter ${row.meter_id}, Account ${row.account_number}`,
      activityCategory: category,
      rawQuantity: usageKwh,
      rawUnit: 'kWh',
      normalizedQuantity: usageKwh,
      normalizedUnit: 'kWh',
      emissionFactor: ef?.factor || 0,
      emissionFactorSource: ef?.source || 'Unknown',
      computedEmissionKgCO2e: emissionKg,
      rawSourceData: { ...row } as unknown as Record<string, unknown>,
      status: flags.some(f => f.severity === 'error') ? 'flagged' : 'pending',
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      flags,
      createdAt: now,
      updatedAt: now,
      editHistory: [],
    };
  });
}

// ─── Travel Data Normalization ───

const EXPENSE_TYPE_MAP: Record<string, { sourceType: SourceType; getCategory: (row: TravelRow, dist: number | null) => string }> = {
  AIRFR: {
    sourceType: 'travel_flights',
    getCategory: (_row, dist) => {
      if (dist) return getFlightCategory(dist);
      return 'flight_medium_haul'; // fallback
    },
  },
  HOTEL: {
    sourceType: 'travel_hotels',
    getCategory: () => 'hotel_night',
  },
  CARRT: {
    sourceType: 'travel_ground',
    getCategory: () => 'car_rental',
  },
  TAXI: {
    sourceType: 'travel_ground',
    getCategory: () => 'taxi',
  },
  TRAIN: {
    sourceType: 'travel_ground',
    getCategory: () => 'train',
  },
};

export function normalizeTravelData(rows: TravelRow[], batchId: string): EmissionRecord[] {
  const now = new Date().toISOString();
  
  return rows.map(row => {
    const flags: DataFlag[] = [];
    
    const typeMapping = EXPENSE_TYPE_MAP[row.expense_type];
    
    if (!typeMapping) {
      flags.push({
        type: 'unit_mismatch',
        message: `Unknown expense type: "${row.expense_type}". Cannot categorize for emissions.`,
        severity: 'error',
        field: 'expense_type',
      });
    }
    
    const sourceType: SourceType = typeMapping?.sourceType || 'travel_ground';
    
    // Distance calculation for flights
    let distanceKm: number | null = null;
    
    if (row.distance_km && parseFloat(row.distance_km) > 0) {
      distanceKm = parseFloat(row.distance_km);
    } else if (row.origin_iata && row.destination_iata) {
      if (row.origin_iata === row.destination_iata) {
        flags.push({
          type: 'date_anomaly',
          message: `Origin and destination are the same (${row.origin_iata}). Likely a data entry error.`,
          severity: 'error',
          field: 'origin_iata',
        });
        distanceKm = 0;
      } else {
        distanceKm = calculateDistanceKm(row.origin_iata, row.destination_iata);
        if (distanceKm === null) {
          flags.push({
            type: 'missing_field',
            message: `Could not calculate distance: unknown airport code(s) ${row.origin_iata}/${row.destination_iata}.`,
            severity: 'warning',
            field: 'origin_iata',
          });
        }
      }
    } else if (row.expense_type === 'AIRFR') {
      flags.push({
        type: 'missing_field',
        message: 'No IATA codes or distance provided for flight. Distance estimated or manual input needed.',
        severity: 'warning',
        field: 'distance_km',
      });
    }
    
    // For hotels, the "quantity" is nights
    let quantity = 0;
    let unit = 'km';
    
    if (row.expense_type === 'HOTEL') {
      quantity = parseInt(row.nights) || 0;
      unit = 'room-night';
      if (quantity === 0) {
        flags.push({
          type: 'missing_field',
          message: 'Hotel stay with 0 nights. Verify data.',
          severity: 'warning',
          field: 'nights',
        });
      }
    } else if (row.expense_type === 'AIRFR') {
      quantity = distanceKm || 0;
      unit = 'passenger-km';
    } else {
      quantity = distanceKm || (row.distance_km ? parseFloat(row.distance_km) : 0);
      unit = 'km';
    }
    
    // Missing cost center
    if (!row.cost_center) {
      flags.push({
        type: 'missing_field',
        message: 'Cost center is empty. Cannot attribute emissions to department.',
        severity: 'warning',
        field: 'cost_center',
      });
    }
    
    const category = typeMapping?.getCategory(row, distanceKm) || 'unknown';
    
    // Adjust for cabin class on long-haul flights
    let effectiveCategory = category;
    if (row.expense_type === 'AIRFR' && row.cabin_class === 'BUSINESS' && category === 'flight_long_haul') {
      effectiveCategory = 'flight_long_haul_business';
    }
    
    const ef = getEmissionFactor(effectiveCategory);
    const emissionKg = ef ? quantity * ef.factor : 0;
    
    return {
      id: uuidv4(),
      batchId,
      tenantId: TENANT_ID,
      sourceType,
      scope: 'scope_3' as const,
      reportingPeriodStart: row.transaction_date,
      reportingPeriodEnd: row.transaction_date,
      facilityCode: row.cost_center || 'UNASSIGNED',
      facilityName: `${row.origin_city}${row.destination_city ? ' → ' + row.destination_city : ''}`,
      country: 'IN',
      activityDescription: `${row.vendor_name} — ${row.description}`,
      activityCategory: effectiveCategory,
      rawQuantity: quantity,
      rawUnit: unit,
      normalizedQuantity: quantity,
      normalizedUnit: unit,
      emissionFactor: ef?.factor || 0,
      emissionFactorSource: ef?.source || 'Unknown',
      computedEmissionKgCO2e: emissionKg,
      rawSourceData: { ...row } as unknown as Record<string, unknown>,
      status: flags.some(f => f.severity === 'error') ? 'flagged' : 'pending',
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
      flags,
      createdAt: now,
      updatedAt: now,
      editHistory: [],
    };
  });
}
