interface MapMarkerOptions {
  map: google.maps.Map;
  position: google.maps.LatLngLiteral;
  title: string;
  categoryId: number;
}

interface PlaceDetailsResponse {
  place: any;
  error?: string;
}

/**
 * Creates a marker with appropriate styling based on category
 */
export function createMapMarker(options: MapMarkerOptions): google.maps.Marker {
  // Get marker color based on category
  const markerColor = getCategoryMarkerColor(options.categoryId);
  
  // Create and return the marker
  return new google.maps.Marker({
    map: options.map,
    position: options.position,
    title: options.title,
    icon: {
      url: `https://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`,
    },
    animation: google.maps.Animation.DROP,
  });
}

/**
 * Get marker color based on category ID
 */
export function getCategoryMarkerColor(categoryId: number): string {
  switch (categoryId) {
    case 1: return 'orange'; // Food
    case 2: return 'purple'; // Lifestyle
    case 3: return 'pink';   // Clothing
    case 4: return 'blue';   // Historical
    case 5: return 'green';  // Nature
    default: return 'red';
  }
}

/**
 * Fetch place details from the API
 */
export async function fetchPlaceDetails(placeId: number): Promise<PlaceDetailsResponse> {
  try {
    const response = await fetch(`/api/places/${placeId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch place details (${response.status})`);
    }
    
    const data = await response.json();
    return { place: data.place };
  } catch (error) {
    console.error('Error fetching place details:', error);
    return { 
      place: null, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Generate a Maps URL for navigation
 */
export function getDirectionsUrl(
  destinationLat: number, 
  destinationLng: number, 
  destinationName: string
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&destination_place_id=${encodeURIComponent(destinationName)}`;
}
