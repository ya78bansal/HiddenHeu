import { useState, useEffect, useCallback } from 'react';

interface Location {
  latitude: string;
  longitude: string;
  city?: string;
  state?: string;
  country?: string;
}

interface GeolocationHook {
  location: Location | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
}

export function useGeolocation(): GeolocationHook {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLocationDetails = async (lat: number, lng: number): Promise<Location> => {
    try {
      // Use Google Maps Geocoding API to get location details
      // In a real app, you would provide an API key in the environment
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=locality|administrative_area_level_1|country&key=AIzaSyC2EcC8GBWAyFmw5RY8A1n1nNhDJeUoUJI`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        
        let city, state, country;
        
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          } else if (component.types.includes('country')) {
            country = component.long_name;
          }
        }
        
        return {
          latitude: lat.toString(),
          longitude: lng.toString(),
          city,
          state,
          country,
        };
      }
      
      // If geocoding fails, just return coordinates
      return {
        latitude: lat.toString(),
        longitude: lng.toString(),
      };
    } catch (error) {
      console.error('Error fetching location details:', error);
      
      // If geocoding fails, just return coordinates
      return {
        latitude: lat.toString(),
        longitude: lng.toString(),
      };
    }
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = await fetchLocationDetails(
          position.coords.latitude,
          position.coords.longitude
        );
        
        setLocation(locationData);
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get your location timed out.';
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  // Request location when component mounts (optional)
  useEffect(() => {
    // Uncomment to automatically request location when component mounts
    // requestLocation();
  }, []);

  return { location, error, loading, requestLocation };
}
