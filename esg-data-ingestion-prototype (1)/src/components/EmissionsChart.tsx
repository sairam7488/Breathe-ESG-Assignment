import type { EmissionRecord } from '../types';
import { useMemo } from 'react';

interface EmissionsChartProps {
  records: EmissionRecord[];
}

function formatKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toFixed(0)}kg`;
}

export function EmissionsChart({ records }: EmissionsChartProps) {
  const data = useMemo(() => {
    const activeRecords = records.filter(r => r.status !== 'rejected');
    
    const categories: Record<string, { label: string; emissions: number; count: number; color: string }> = {};
    
    const colorMap: Record<string, string> = {
      diesel_combustion: 'bg-blue-500',
      petrol_combustion: 'bg-blue-400',
      natural_gas_combustion: 'bg-blue-300',
      lpg_combustion: 'bg-blue-200',
      fuel_oil_combustion: 'bg-blue-600',
      electricity_grid_us: 'bg-violet-500',
      electricity_grid_eu: 'bg-violet-400',
      electricity_grid_asia: 'bg-violet-300',
      flight_short_haul: 'bg-cyan-400',
      flight_medium_haul: 'bg-cyan-500',
      flight_long_haul: 'bg-cyan-600',
      flight_long_haul_business: 'bg-cyan-700',
      flight_domestic_short: 'bg-cyan-300',
      hotel_night: 'bg-pink-400',
      car_rental: 'bg-teal-400',
      taxi: 'bg-teal-300',
      train: 'bg-teal-500',
    };
    
    const labelMap: Record<string, string> = {
      diesel_combustion: 'Diesel',
      petrol_combustion: 'Petrol/Gasoline',
      natural_gas_combustion: 'Natural Gas',
      lpg_combustion: 'LPG',
      fuel_oil_combustion: 'Fuel Oil',
      electricity_grid_us: 'Electricity (US)',
      electricity_grid_eu: 'Electricity (EU)',
      electricity_grid_asia: 'Electricity (Asia)',
      flight_short_haul: 'Flights (Short)',
      flight_medium_haul: 'Flights (Medium)',
      flight_long_haul: 'Flights (Long)',
      flight_long_haul_business: 'Flights (Biz)',
      flight_domestic_short: 'Flights (Domestic)',
      hotel_night: 'Hotels',
      car_rental: 'Car Rental',
      taxi: 'Taxi',
      train: 'Rail',
    };
    
    activeRecords.forEach(r => {
      const cat = r.activityCategory;
      if (!categories[cat]) {
        categories[cat] = {
          label: labelMap[cat] || cat,
          emissions: 0,
          count: 0,
          color: colorMap[cat] || 'bg-gray-400',
        };
      }
      categories[cat].emissions += r.computedEmissionKgCO2e;
      categories[cat].count += 1;
    });
    
    return Object.values(categories)
      .filter(c => c.emissions > 0)
      .sort((a, b) => b.emissions - a.emissions);
  }, [records]);
  
  const maxEmissions = data.length > 0 ? Math.max(...data.map(d => d.emissions)) : 1;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">Emissions by Category</h3>
      <div className="space-y-3">
        {data.map(cat => (
          <div key={cat.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 font-medium">{cat.label}</span>
              <span className="text-xs text-gray-500 font-mono">
                {formatKg(cat.emissions)} CO₂e
                <span className="text-gray-400 ml-1">({cat.count})</span>
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                style={{ width: `${(cat.emissions / maxEmissions) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No emission data to display.</p>
        )}
      </div>
    </div>
  );
}
