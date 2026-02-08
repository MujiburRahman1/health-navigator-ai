// Geospatial utility functions for healthcare facility analysis

// Ghana region coordinates (approximate centers)
export const REGION_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'greater accra': { lat: 5.6037, lng: -0.1870, name: 'Greater Accra' },
  'accra': { lat: 5.6037, lng: -0.1870, name: 'Accra' },
  'ashanti': { lat: 6.6885, lng: -1.6244, name: 'Ashanti Region' },
  'kumasi': { lat: 6.6885, lng: -1.6244, name: 'Kumasi' },
  'northern': { lat: 9.4034, lng: -0.8424, name: 'Northern Region' },
  'tamale': { lat: 9.4034, lng: -0.8424, name: 'Tamale' },
  'volta': { lat: 6.6018, lng: 0.4703, name: 'Volta Region' },
  'eastern': { lat: 6.6500, lng: -0.4500, name: 'Eastern Region' },
  'western': { lat: 5.0088, lng: -1.9796, name: 'Western Region' },
  'takoradi': { lat: 4.8845, lng: -1.7554, name: 'Takoradi' },
  'central': { lat: 5.5500, lng: -1.0500, name: 'Central Region' },
  'cape coast': { lat: 5.1315, lng: -1.2795, name: 'Cape Coast' },
  'upper east': { lat: 10.7548, lng: -0.8508, name: 'Upper East Region' },
  'bolgatanga': { lat: 10.7548, lng: -0.8508, name: 'Bolgatanga' },
  'upper west': { lat: 10.3524, lng: -2.2831, name: 'Upper West Region' },
  'bono': { lat: 7.3349, lng: -2.3123, name: 'Bono Region' },
  'bono east': { lat: 7.7500, lng: -1.0500, name: 'Bono East Region' },
  'ahafo': { lat: 7.0833, lng: -2.3333, name: 'Ahafo Region' },
  'savannah': { lat: 9.0000, lng: -1.5000, name: 'Savannah Region' },
  'north east': { lat: 10.5000, lng: 0.0000, name: 'North East Region' },
  'oti': { lat: 7.8000, lng: 0.2000, name: 'Oti Region' },
  'western north': { lat: 6.2000, lng: -2.5000, name: 'Western North Region' },
};

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get coordinates for a region/location string
export function getCoordinatesForLocation(location: string): { lat: number; lng: number } | null {
  const normalized = location.toLowerCase().trim();
  
  // Direct match
  if (REGION_COORDINATES[normalized]) {
    return REGION_COORDINATES[normalized];
  }
  
  // Partial match
  for (const [key, coords] of Object.entries(REGION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  
  return null;
}

// Find facilities within a radius of a location
export interface FacilityWithDistance {
  id: string;
  name: string;
  region: string;
  distance: number;
  lat: number;
  lng: number;
}

export function findFacilitiesWithinRadius(
  facilities: Array<{ id: string; name: string; region: string | null }>,
  centerLat: number,
  centerLng: number,
  radiusKm: number
): FacilityWithDistance[] {
  const results: FacilityWithDistance[] = [];
  
  for (const facility of facilities) {
    const coords = getCoordinatesForLocation(facility.region || '');
    if (!coords) continue;
    
    // Add some randomization for multiple facilities in same region
    const offset = (parseInt(facility.id.slice(-4), 16) % 100) / 1000;
    const facilityLat = coords.lat + offset;
    const facilityLng = coords.lng + offset;
    
    const distance = calculateDistance(centerLat, centerLng, facilityLat, facilityLng);
    
    if (distance <= radiusKm) {
      results.push({
        id: facility.id,
        name: facility.name,
        region: facility.region || 'Unknown',
        distance: Math.round(distance * 10) / 10,
        lat: facilityLat,
        lng: facilityLng,
      });
    }
  }
  
  return results.sort((a, b) => a.distance - b.distance);
}

// Identify cold spots - regions with no coverage for a specialty
export interface ColdSpot {
  region: string;
  lat: number;
  lng: number;
  nearestFacilityDistance: number;
  nearestFacilityName: string;
}

export function identifyColdSpots(
  facilitiesWithSpecialty: Array<{ id: string; name: string; region: string | null }>,
  allRegions: string[]
): ColdSpot[] {
  const coldSpots: ColdSpot[] = [];
  const coveredRegions = new Set(facilitiesWithSpecialty.map(f => f.region?.toLowerCase()));
  
  for (const region of allRegions) {
    const regionLower = region.toLowerCase();
    if (coveredRegions.has(regionLower)) continue;
    
    const coords = getCoordinatesForLocation(region);
    if (!coords) continue;
    
    // Find nearest facility with the specialty
    let nearestDistance = Infinity;
    let nearestName = 'None found';
    
    for (const facility of facilitiesWithSpecialty) {
      const facilityCoords = getCoordinatesForLocation(facility.region || '');
      if (!facilityCoords) continue;
      
      const distance = calculateDistance(coords.lat, coords.lng, facilityCoords.lat, facilityCoords.lng);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestName = facility.name;
      }
    }
    
    coldSpots.push({
      region,
      lat: coords.lat,
      lng: coords.lng,
      nearestFacilityDistance: Math.round(nearestDistance * 10) / 10,
      nearestFacilityName: nearestName,
    });
  }
  
  return coldSpots.sort((a, b) => b.nearestFacilityDistance - a.nearestFacilityDistance);
}

// Estimate travel time based on distance (rough approximation)
export function estimateTravelTime(distanceKm: number): string {
  // Assume average speed of 40 km/h in Ghana (accounting for road conditions)
  const hours = distanceKm / 40;
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hours`;
  } else {
    return `${Math.round(hours / 24)} days`;
  }
}
