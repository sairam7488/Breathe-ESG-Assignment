import type { PlantCodeMapping } from '../types';

// SAP plant codes are typically 4-character alphanumeric.
// Real clients often have codes that are cryptic and require a lookup table.
// Indian enterprise context with major industrial locations.
export const PLANT_CODES: PlantCodeMapping[] = [
  { code: '1000', name: 'Jamshedpur Steel Plant', country: 'IN', region: 'East India' },
  { code: '1100', name: 'Jamshedpur Tubes Division', country: 'IN', region: 'East India' },
  { code: '2000', name: 'Mumbai Corporate HQ', country: 'IN', region: 'West India' },
  { code: '2100', name: 'Pune Manufacturing', country: 'IN', region: 'West India' },
  { code: '3000', name: 'Chennai Auto Plant', country: 'IN', region: 'South India' },
  { code: '3100', name: 'Bangalore Tech Park', country: 'IN', region: 'South India' },
  { code: '4000', name: 'Delhi NCR Office', country: 'IN', region: 'North India' },
  { code: 'W001', name: 'Haldia Port Facility', country: 'IN', region: 'East India' },
  { code: 'W002', name: 'Vizag Warehouse', country: 'IN', region: 'South India' },
  { code: '5000', name: 'Ahmedabad Chemical Plant', country: 'IN', region: 'West India' },
];

export function lookupPlant(code: string): PlantCodeMapping | undefined {
  return PLANT_CODES.find(p => p.code === code);
}
