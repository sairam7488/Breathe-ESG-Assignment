import type { Airport } from '../types';

// Subset of major airports for distance calculation — Indian focus with international destinations
export const AIRPORTS: Airport[] = [
  // Indian Airports
  { iata: 'DEL', name: 'Indira Gandhi International', lat: 28.5562, lon: 77.1000, country: 'IN' },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', lat: 19.0896, lon: 72.8656, country: 'IN' },
  { iata: 'BLR', name: 'Kempegowda International', lat: 13.1986, lon: 77.7066, country: 'IN' },
  { iata: 'MAA', name: 'Chennai International', lat: 12.9941, lon: 80.1709, country: 'IN' },
  { iata: 'CCU', name: 'Netaji Subhas Chandra Bose International', lat: 22.6547, lon: 88.4467, country: 'IN' },
  { iata: 'HYD', name: 'Rajiv Gandhi International', lat: 17.2403, lon: 78.4294, country: 'IN' },
  { iata: 'AMD', name: 'Sardar Vallabhbhai Patel International', lat: 23.0772, lon: 72.6347, country: 'IN' },
  { iata: 'PNQ', name: 'Pune Airport', lat: 18.5822, lon: 73.9197, country: 'IN' },
  { iata: 'GOI', name: 'Goa International', lat: 15.3808, lon: 73.8314, country: 'IN' },
  { iata: 'COK', name: 'Cochin International', lat: 10.1520, lon: 76.4019, country: 'IN' },
  
  // International Airports
  { iata: 'DXB', name: 'Dubai International', lat: 25.2532, lon: 55.3657, country: 'AE' },
  { iata: 'SIN', name: 'Singapore Changi', lat: 1.3644, lon: 103.9915, country: 'SG' },
  { iata: 'LHR', name: 'London Heathrow', lat: 51.4700, lon: -0.4543, country: 'GB' },
  { iata: 'JFK', name: 'John F. Kennedy International', lat: 40.6413, lon: -73.7781, country: 'US' },
  { iata: 'FRA', name: 'Frankfurt Airport', lat: 50.0379, lon: 8.5622, country: 'DE' },
  { iata: 'HKG', name: 'Hong Kong International', lat: 22.3080, lon: 113.9185, country: 'HK' },
  { iata: 'NRT', name: 'Narita International', lat: 35.7720, lon: 140.3929, country: 'JP' },
  { iata: 'SFO', name: 'San Francisco International', lat: 37.6213, lon: -122.3790, country: 'US' },
  { iata: 'AMS', name: 'Amsterdam Schiphol', lat: 52.3105, lon: 4.7683, country: 'NL' },
  { iata: 'BKK', name: 'Suvarnabhumi Airport', lat: 13.6900, lon: 100.7501, country: 'TH' },
];

// Haversine distance in km between two airports
export function calculateDistanceKm(iata1: string, iata2: string): number | null {
  const a1 = AIRPORTS.find(a => a.iata === iata1);
  const a2 = AIRPORTS.find(a => a.iata === iata2);
  if (!a1 || !a2) return null;
  
  const R = 6371; // Earth's radius in km
  const dLat = (a2.lat - a1.lat) * Math.PI / 180;
  const dLon = (a2.lon - a1.lon) * Math.PI / 180;
  const lat1 = a1.lat * Math.PI / 180;
  const lat2 = a2.lat * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

export function getFlightCategory(distanceKm: number): string {
  if (distanceKm < 500) return 'flight_domestic_short';
  if (distanceKm < 1600) return 'flight_short_haul';
  if (distanceKm < 3700) return 'flight_medium_haul';
  return 'flight_long_haul';
}
