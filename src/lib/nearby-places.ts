const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS = 2000; // meters

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: PlaceCategory;
  type: string;
  distance?: number;
}

export type PlaceCategory =
  | 'food'
  | 'health'
  | 'education'
  | 'bank'
  | 'shopping'
  | 'transport'
  | 'tourism'
  | 'leisure';

export interface PlaceCategoryInfo {
  id: PlaceCategory;
  label: string;
  color: string;
}

export const PLACE_CATEGORIES: PlaceCategoryInfo[] = [
  { id: 'food', label: 'Restaurants & Cafes', color: '#e74c3c' },
  { id: 'health', label: 'Hospitals & Clinics', color: '#e74c3c' },
  { id: 'education', label: 'Schools & Colleges', color: '#f39c12' },
  { id: 'bank', label: 'Banks & ATMs', color: '#2ecc71' },
  { id: 'shopping', label: 'Shopping & Malls', color: '#9b59b6' },
  { id: 'transport', label: 'Railway Stations', color: '#3498db' },
  { id: 'tourism', label: 'Hotels & Attractions', color: '#1abc9c' },
  { id: 'leisure', label: 'Parks & Gardens', color: '#27ae60' },
];

const CATEGORY_MAP: Record<string, PlaceCategory> = {
  restaurant: 'food',
  cafe: 'food',
  food: 'food',
  fast_food: 'food',
  pub: 'food',
  bar: 'food',
  hospital: 'health',
  clinic: 'health',
  doctors: 'health',
  dentist: 'health',
  pharmacy: 'health',
  school: 'education',
  college: 'education',
  university: 'education',
  kindergarten: 'education',
  library: 'education',
  bank: 'bank',
  atm: 'bank',
  supermarket: 'shopping',
  mall: 'shopping',
  department_store: 'shopping',
  marketplace: 'shopping',
  shopping: 'shopping',
  railway: 'transport',
  bus_station: 'transport',
  station: 'transport',
  hotel: 'tourism',
  hostel: 'tourism',
  guest_house: 'tourism',
  attraction: 'tourism',
  museum: 'tourism',
  monument: 'tourism',
  viewpoint: 'tourism',
  zoo: 'leisure',
  park: 'leisure',
  garden: 'leisure',
  playground: 'leisure',
  sports_centre: 'leisure',
  stadium: 'leisure',
};

function categorizePlace(type: string, amenity?: string): PlaceCategory {
  const key = amenity || type;
  return CATEGORY_MAP[key] || 'tourism';
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  radius: number = SEARCH_RADIUS,
  signal?: AbortSignal
): Promise<NearbyPlace[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"](around:${radius},${lat},${lng});
      node["shop"](around:${radius},${lat},${lng});
      node["tourism"](around:${radius},${lat},${lng});
      node["leisure"](around:${radius},${lat},${lng});
      node["railway"="station"](around:${radius},${lat},${lng});
    );
    out center 50;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  const elements: any[] = data.elements || [];

  const places: NearbyPlace[] = elements
    .filter((el: any) => {
      const tags = el.tags || {};
      return tags.name && typeof tags.name === 'string' && tags.name.trim();
    })
    .map((el: any) => {
      const tags = el.tags || {};
      const amenity =
        tags.amenity || tags.shop || tags.tourism || tags.leisure || tags.railway || '';
      const category = categorizePlace(amenity, amenity);
      const placeLat = el.lat || el.center?.lat || lat;
      const placeLng = el.lon || el.center?.lon || lng;

      return {
        id: `osm-${el.type}-${el.id}`,
        name: tags.name.trim(),
        lat: placeLat,
        lng: placeLng,
        category,
        type: amenity || 'attraction',
        distance: Math.round(haversineDistance(lat, lng, placeLat, placeLng)),
      };
    })
    .sort((a: NearbyPlace, b: NearbyPlace) => (a.distance || 0) - (b.distance || 0))
    .slice(0, 40);

  return places;
}

export function getCategoryInfo(category: PlaceCategory): PlaceCategoryInfo {
  return PLACE_CATEGORIES.find((c) => c.id === category) || PLACE_CATEGORIES[0];
}
