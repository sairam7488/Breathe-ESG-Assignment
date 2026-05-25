import type { UtilityRow } from '../types';

/**
 * Realistic utility portal CSV export data — Indian context.
 * 
 * Why this shape:
 * - Indian facilities typically get electricity from state DISCOMs
 *   (MSEDCL, TATA Power, BESCOM, TANGEDCO, CESC, etc.)
 * - Billing periods often align with calendar months in India
 * - HT (High Tension) connections have demand charges in kVA
 * - Meter IDs follow state-specific formats
 * - Tariff codes like HT-I (Industrial), LT-II (Commercial), etc.
 * 
 * Deliberate data quality issues:
 * - One row has billing_period_start after billing_period_end (data entry error)
 * - One row has unusually high usage (outlier — possible captive power failure)
 * - One row has empty usage_kwh (meter not read)
 * - Billing periods vary across states
 */
export const SAMPLE_UTILITY_DATA: UtilityRow[] = [
  {
    account_number: 'MSEDCL-170823456',
    meter_id: 'MH-HT-001234',
    service_address: 'Plot A-12, MIDC Chakan, Pune 410501',
    billing_period_start: '01/04/2024',
    billing_period_end: '30/04/2024',
    read_date: '30/04/2024',
    meter_read_previous: '245230',
    meter_read_current: '267890',
    usage_kwh: '22660',
    demand_kw: '485',
    tariff_code: 'HT-I',
    total_charges: '181280.00',
    currency: 'INR',
  },
  {
    account_number: 'MSEDCL-170823456',
    meter_id: 'MH-HT-001234',
    service_address: 'Plot A-12, MIDC Chakan, Pune 410501',
    billing_period_start: '01/05/2024',
    billing_period_end: '31/05/2024',
    read_date: '31/05/2024',
    meter_read_previous: '267890',
    meter_read_current: '292150',
    usage_kwh: '24260',
    demand_kw: '510',
    tariff_code: 'HT-I',
    total_charges: '194080.00',
    currency: 'INR',
  },
  {
    account_number: 'MSEDCL-170823456',
    meter_id: 'MH-HT-001234',
    service_address: 'Plot A-12, MIDC Chakan, Pune 410501',
    billing_period_start: '01/06/2024',
    billing_period_end: '30/06/2024',
    read_date: '30/06/2024',
    meter_read_previous: '292150',
    meter_read_current: '318400',
    usage_kwh: '26250',
    demand_kw: '535',
    tariff_code: 'HT-I',
    total_charges: '210000.00',
    currency: 'INR',
  },
  {
    account_number: 'TATA-HT-5567890',
    meter_id: 'MUM-IND-00567',
    service_address: 'Nariman Point, Mumbai 400021',
    billing_period_start: '01/04/2024',
    billing_period_end: '30/04/2024',
    read_date: '30/04/2024',
    meter_read_previous: '88450',
    meter_read_current: '94230',
    usage_kwh: '5780',
    demand_kw: '185',
    tariff_code: 'HT-COM',
    total_charges: '52020.00',
    currency: 'INR',
  },
  {
    account_number: 'TATA-HT-5567890',
    meter_id: 'MUM-IND-00567',
    service_address: 'Nariman Point, Mumbai 400021',
    billing_period_start: '01/05/2024',
    billing_period_end: '31/05/2024',
    read_date: '31/05/2024',
    meter_read_previous: '94230',
    meter_read_current: '158900', // Outlier — ~64,670 kWh vs normal ~5,700
    usage_kwh: '64670',
    demand_kw: '890',
    tariff_code: 'HT-COM',
    total_charges: '582030.00',
    currency: 'INR',
  },
  {
    account_number: 'CESC-23456789',
    meter_id: 'WB-HT-078901',
    service_address: 'Bistupur Industrial Area, Jamshedpur 831001',
    billing_period_start: '01/04/2024',
    billing_period_end: '30/04/2024',
    read_date: '30/04/2024',
    meter_read_previous: '1204100',
    meter_read_current: '1318500',
    usage_kwh: '114400',
    demand_kw: '2520',
    tariff_code: 'HT-IND',
    total_charges: '858000.00',
    currency: 'INR',
  },
  {
    account_number: 'CESC-23456789',
    meter_id: 'WB-HT-078901',
    service_address: 'Bistupur Industrial Area, Jamshedpur 831001',
    billing_period_start: '01/06/2024', // ERROR: start > end (swapped dates)
    billing_period_end: '31/05/2024',
    read_date: '31/05/2024',
    meter_read_previous: '1318500',
    meter_read_current: '1428800',
    usage_kwh: '110300',
    demand_kw: '2480',
    tariff_code: 'HT-IND',
    total_charges: '827250.00',
    currency: 'INR',
  },
  {
    account_number: 'BESCOM-IND-445566',
    meter_id: 'KA-HT-334455',
    service_address: 'ITPL Road, Whitefield, Bangalore 560066',
    billing_period_start: '01/04/2024',
    billing_period_end: '30/04/2024',
    read_date: '30/04/2024',
    meter_read_previous: '56200',
    meter_read_current: '63800',
    usage_kwh: '7600',
    demand_kw: '220',
    tariff_code: 'HT-2A',
    total_charges: '60800.00',
    currency: 'INR',
  },
  {
    account_number: 'TANGEDCO-778899',
    meter_id: 'TN-HT-112233',
    service_address: 'Ambattur Industrial Estate, Chennai 600058',
    billing_period_start: '01/04/2024',
    billing_period_end: '30/04/2024',
    read_date: '30/04/2024',
    meter_read_previous: '33100',
    meter_read_current: '33100', // No usage — meter not read or plant shutdown
    usage_kwh: '',
    demand_kw: '0',
    tariff_code: 'HT-IA',
    total_charges: '5500.00', // Minimum demand charges
    currency: 'INR',
  },
  {
    account_number: 'MSEDCL-170823456',
    meter_id: 'MH-HT-001235', // Second meter at same account (common for large facilities)
    service_address: 'Plot A-12, MIDC Chakan, Pune 410501 - Unit 2',
    billing_period_start: '01/04/2024',
    billing_period_end: '30/04/2024',
    read_date: '30/04/2024',
    meter_read_previous: '45000',
    meter_read_current: '52350',
    usage_kwh: '7350',
    demand_kw: '178',
    tariff_code: 'HT-I',
    total_charges: '58800.00',
    currency: 'INR',
  },
];

export function generateUtilityCSV(): string {
  const headers = ['account_number', 'meter_id', 'service_address', 'billing_period_start', 'billing_period_end', 'read_date', 'meter_read_previous', 'meter_read_current', 'usage_kwh', 'demand_kw', 'tariff_code', 'total_charges', 'currency'];
  const rows = SAMPLE_UTILITY_DATA.map(row =>
    headers.map(h => `"${(row as unknown as Record<string, string>)[h] || ''}"`)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
