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
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  requestLocation: () => void;
}

export function useGeolocation(): GeolocationHook {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLocationDetails = async (lat: number, lng: number): Promise<Location> => {
    try {
      // For now, we'll use a simpler approach just focusing on the coordinates
      // Later, we can integrate a proper geocoding service with the correct API key
      
      // Attempt basic reverse geocoding using a free service that doesn't require API key
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'HiddenHeu Travel Guide Application'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          return {
            latitude: lat.toString(),
            longitude: lng.toString(),
            city: data?.address?.city || data?.address?.town || data?.address?.village,
            state: data?.address?.state,
            country: data?.address?.country,
          };
        }
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        // Fail silently and continue with just coordinates
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

  // Add states to track permission status
  const [permissionStatus, setPermissionStatus] = useState<'prompt'|'granted'|'denied'|'unknown'>('unknown');
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Check permission status when component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const checkPermissions = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          
          setPermissionStatus(result.state as 'prompt'|'granted'|'denied');
          
          // If permission is already granted, request location automatically
          if (result.state === 'granted' && !location) {
            requestLocation();
          }
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setPermissionStatus(result.state as 'prompt'|'granted'|'denied');
            if (result.state === 'granted' && !location) {
              requestLocation();
            }
          });
        }
      } catch (err) {
        console.error("Permission API error:", err);
        setPermissionStatus('unknown');
      }
    };
    
    checkPermissions();
  }, [location, requestLocation]);

  return { 
    location, 
    error, 
    loading, 
    permissionStatus,
    requestLocation 
  };
}
