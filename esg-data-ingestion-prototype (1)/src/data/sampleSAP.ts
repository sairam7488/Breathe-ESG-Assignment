import type { SAPFuelRow } from '../types';

/**
 * Realistic SAP MB51 flat-file export data — Indian enterprise context.
 * 
 * Why this shape:
 * - SAP exports material movements via transaction MB51 (Material Document List)
 * - BWART 261 = goods issue to production/cost center (fuel consumption)
 * - BWART 201 = goods issue for cost center (maintenance supplies, not fuel)
 * - Dates appear in YYYYMMDD (SAP internal) but some configs export DD.MM.YYYY
 * - MEINS uses SAP internal unit codes (L, KG, GAL, TO, KL for kiloliters)
 * - Indian SAP installations may have Hindi descriptions in some fields
 * 
 * Deliberate data quality issues included:
 * - Row with Hindi description
 * - Row with KL (kiloliter) unit requiring conversion
 * - Row with DD.MM.YYYY date format
 * - Row with negative quantity (return/reversal)
 * - Row with movement type 201 (not fuel — should be filtered or flagged)
 * - Row with unknown plant code
 */
export const SAMPLE_SAP_DATA: SAPFuelRow[] = [
  {
    MBLNR: '4900012345',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010001234',
    MAKTX: 'HSD - High Speed Diesel BS-VI',
    WERKS: '1000',
    LGORT: '0001',
    MENGE: '5200.000',
    MEINS: 'L',
    BUDAT: '20240415',
    KOSTL: '0000410100',
    SGTXT: 'Jamshedpur plant DG sets - April',
    WAERS: 'INR',
    DMBTR: '468000.00',
  },
  {
    MBLNR: '4900012346',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010001234',
    MAKTX: 'डीजल ईंधन (HSD)', // Hindi description
    WERKS: '2100',
    LGORT: '0001',
    MENGE: '3.150', // Kiloliters
    MEINS: 'KL',    // Kiloliter — needs conversion to liters
    BUDAT: '15.05.2024', // DD.MM.YYYY format
    KOSTL: '0000420200',
    SGTXT: 'Pune plant generators',
    WAERS: 'INR',
    DMBTR: '283500.00',
  },
  {
    MBLNR: '4900012400',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010001235',
    MAKTX: 'HSD - Industrial Grade',
    WERKS: 'W001',
    LGORT: '0001',
    MENGE: '8500.000',
    MEINS: 'L',
    BUDAT: '20240501',
    KOSTL: '0000430100',
    SGTXT: 'Haldia port operations - May',
    WAERS: 'INR',
    DMBTR: '765000.00',
  },
  {
    MBLNR: '4900012401',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010002000',
    MAKTX: 'Petrol MS - BS VI Grade',
    WERKS: '2000',
    LGORT: '0002',
    MENGE: '920.500',
    MEINS: 'L',
    BUDAT: '20240515',
    KOSTL: '0000410100',
    SGTXT: 'Mumbai HQ company vehicles',
    WAERS: 'INR',
    DMBTR: '97369.00',
  },
  {
    MBLNR: '4900012500',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010003000',
    MAKTX: 'PNG - Piped Natural Gas',
    WERKS: '5000',
    LGORT: '0001',
    MENGE: '15000.000',
    MEINS: 'M3',
    BUDAT: '20240601',
    KOSTL: '0000440100',
    SGTXT: 'Ahmedabad plant process heating Q1',
    WAERS: 'INR',
    DMBTR: '675000.00',
  },
  {
    MBLNR: '4900012501',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010001234',
    MAKTX: 'HSD - High Speed Diesel',
    WERKS: '1000',
    LGORT: '0001',
    MENGE: '-450.000', // NEGATIVE: fuel return / reversal
    MEINS: 'L',
    BUDAT: '20240610',
    KOSTL: '0000410100',
    SGTXT: 'Correction - tank measurement error',
    WAERS: 'INR',
    DMBTR: '-40500.00',
  },
  {
    MBLNR: '4900012600',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '201', // NOT fuel consumption — general goods issue
    MATNR: '000000000020005000',
    MAKTX: 'Lubricating Oil SAE 40',
    WERKS: '1000',
    LGORT: '0003',
    MENGE: '55.000',
    MEINS: 'L',
    BUDAT: '20240615',
    KOSTL: '0000410100',
    SGTXT: 'Equipment maintenance - rolling mill',
    WAERS: 'INR',
    DMBTR: '13750.00',
  },
  {
    MBLNR: '4900012700',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010004000',
    MAKTX: 'LPG - Industrial',
    WERKS: '3000',
    LGORT: '0001',
    MENGE: '2800.000',
    MEINS: 'L',
    BUDAT: '20240701',
    KOSTL: '0000450100',
    SGTXT: 'Chennai auto plant - forklift fleet',
    WAERS: 'INR',
    DMBTR: '154000.00',
  },
  {
    MBLNR: '4900012800',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010005000',
    MAKTX: 'Furnace Oil - Industrial Grade',
    WERKS: '1100',
    LGORT: '0001',
    MENGE: '12000.000',
    MEINS: 'L',
    BUDAT: '20240715',
    KOSTL: '0000420300',
    SGTXT: 'Tubes division furnace operation',
    WAERS: 'INR',
    DMBTR: '540000.00',
  },
  {
    MBLNR: '4900012900',
    MJAHR: '2024',
    ZEILE: '0001',
    BWART: '261',
    MATNR: '000000000010001234',
    MAKTX: 'HSD Diesel Fuel',
    WERKS: 'X999', // Unknown plant code — should flag
    LGORT: '0001',
    MENGE: '2200.000',
    MEINS: 'L',
    BUDAT: '20240801',
    KOSTL: '0000490100',
    SGTXT: 'New Odisha site - code pending',
    WAERS: 'INR',
    DMBTR: '198000.00',
  },
];

export function generateSAPCSV(): string {
  const headers = ['MBLNR', 'MJAHR', 'ZEILE', 'BWART', 'MATNR', 'MAKTX', 'WERKS', 'LGORT', 'MENGE', 'MEINS', 'BUDAT', 'KOSTL', 'SGTXT', 'WAERS', 'DMBTR'];
  const rows = SAMPLE_SAP_DATA.map(row =>
    headers.map(h => `"${(row as unknown as Record<string, string>)[h] || ''}"`)
      .join('|') // SAP flat files often use pipe delimiter
  );
  return [headers.join('|'), ...rows].join('\n');
}
