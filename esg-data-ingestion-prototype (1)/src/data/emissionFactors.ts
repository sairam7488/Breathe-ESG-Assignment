// Emission factors sourced from DEFRA 2024, CEA India 2023, and GHG Protocol
// Real-world ESG platforms maintain emission factor databases; here we use a representative subset.

export interface EmissionFactorEntry {
  category: string;
  factor: number; // kgCO2e per unit
  unit: string;
  source: string;
}

export const EMISSION_FACTORS: Record<string, EmissionFactorEntry> = {
  // Scope 1 — Direct combustion
  diesel_combustion: {
    category: 'diesel_combustion',
    factor: 2.68, // kgCO2e per liter (India BS-VI diesel)
    unit: 'L',
    source: 'IPCC 2006 / India GHG Program',
  },
  petrol_combustion: {
    category: 'petrol_combustion',
    factor: 2.30, // kgCO2e per liter
    unit: 'L',
    source: 'IPCC 2006 / India GHG Program',
  },
  natural_gas_combustion: {
    category: 'natural_gas_combustion',
    factor: 2.02, // kgCO2e per m³
    unit: 'm³',
    source: 'IPCC 2006 — Natural Gas',
  },
  lpg_combustion: {
    category: 'lpg_combustion',
    factor: 1.56,
    unit: 'L',
    source: 'IPCC 2006 — LPG',
  },
  fuel_oil_combustion: {
    category: 'fuel_oil_combustion',
    factor: 3.15,
    unit: 'L',
    source: 'IPCC 2006 — Fuel Oil',
  },
  furnace_oil_combustion: {
    category: 'furnace_oil_combustion',
    factor: 3.20,
    unit: 'L',
    source: 'India GHG Program — Furnace Oil',
  },
  
  // Scope 2 — Purchased electricity (location-based)
  electricity_grid_india: {
    category: 'electricity_grid_india',
    factor: 0.82, // kgCO2e per kWh (CEA 2023 weighted average)
    unit: 'kWh',
    source: 'CEA India CO2 Database 2023 — National Grid Average',
  },
  electricity_grid_india_north: {
    category: 'electricity_grid_india_north',
    factor: 0.85, // Northern region slightly higher coal dependency
    unit: 'kWh',
    source: 'CEA India 2023 — Northern Region',
  },
  electricity_grid_india_south: {
    category: 'electricity_grid_india_south',
    factor: 0.78, // Southern region more hydro/renewables
    unit: 'kWh',
    source: 'CEA India 2023 — Southern Region',
  },
  electricity_grid_india_west: {
    category: 'electricity_grid_india_west',
    factor: 0.80,
    unit: 'kWh',
    source: 'CEA India 2023 — Western Region',
  },
  electricity_grid_india_east: {
    category: 'electricity_grid_india_east',
    factor: 0.88, // Eastern region higher coal
    unit: 'kWh',
    source: 'CEA India 2023 — Eastern Region',
  },
  
  // Scope 3 — Business travel
  flight_domestic_short: {
    category: 'flight_domestic_short',
    factor: 0.255, // kgCO2e per passenger-km
    unit: 'passenger-km',
    source: 'DEFRA 2024 — Domestic flights, average',
  },
  flight_short_haul: {
    category: 'flight_short_haul',
    factor: 0.156,
    unit: 'passenger-km',
    source: 'DEFRA 2024 — Short-haul international, economy',
  },
  flight_medium_haul: {
    category: 'flight_medium_haul',
    factor: 0.138,
    unit: 'passenger-km',
    source: 'DEFRA 2024 — Medium-haul, economy',
  },
  flight_long_haul: {
    category: 'flight_long_haul',
    factor: 0.195,
    unit: 'passenger-km',
    source: 'DEFRA 2024 — Long-haul, economy (with RF)',
  },
  flight_long_haul_business: {
    category: 'flight_long_haul_business',
    factor: 0.566,
    unit: 'passenger-km',
    source: 'DEFRA 2024 — Long-haul, business class (with RF)',
  },
  hotel_night: {
    category: 'hotel_night',
    factor: 18.5, // kgCO2e per room-night (India average)
    unit: 'room-night',
    source: 'GHG Protocol — Hotel stays, India average',
  },
  car_rental: {
    category: 'car_rental',
    factor: 0.165, // kgCO2e per km
    unit: 'km',
    source: 'India GHG Program — Average car',
  },
  taxi: {
    category: 'taxi',
    factor: 0.185,
    unit: 'km',
    source: 'India GHG Program — Taxi/cab service',
  },
  train: {
    category: 'train',
    factor: 0.041, // Indian Railways average
    unit: 'km',
    source: 'Indian Railways Sustainability Report 2023',
  },
};

export function getEmissionFactor(category: string): EmissionFactorEntry | undefined {
  return EMISSION_FACTORS[category];
}
