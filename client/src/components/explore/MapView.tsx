import { useState, useEffect, useRef } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceDetails, createMapMarker, getDirectionsUrl, calculateDistance } from '@/lib/mapUtils';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import PlaceDetails from './PlaceDetails';

interface MapViewProps {
  className?: string;
}

export default function MapView({ className = '' }: MapViewProps) {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const cityId = searchParams.get("city");
  const categoryId = searchParams.get("category");
  const { toast } = useToast();
  
  // Get user's geolocation
  const { 
    location: userGeoLocation, 
    error: locationError, 
    loading: locationLoading,
    requestLocation 
  } = useGeolocation();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Center of India by default
  const [mapZoom, setMapZoom] = useState(5);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showDirections, setShowDirections] = useState(false);

  // Fetch places based on filters
  const { data: placesData, isLoading } = useQuery({
    queryKey: ['/api/places', cityId, categoryId],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (cityId) queryParams.append('cityId', cityId);
      if (categoryId) queryParams.append('categoryId', categoryId);
      
      const response = await fetch(`/api/places?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch places');
      return response.json();
    },
  });

  // Fetch city data if cityId is provided
  const { data: cityData } = useQuery<{city: {latitude: string, longitude: string}}>({
    queryKey: cityId ? [`/api/cities/${cityId}`] : [],
    enabled: !!cityId,
  });

  // Get user location when available
  useEffect(() => {
    if (userGeoLocation) {
      setUserLocation({
        lat: parseFloat(userGeoLocation.latitude),
        lng: parseFloat(userGeoLocation.longitude)
      });
    }
  }, [userGeoLocation]);

  // Initialize the map
  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    // Create the map instance
    const map = new google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });
    
    mapInstanceRef.current = map;

    // Add user location marker if available
    if (userLocation) {
      new google.maps.Marker({
        position: userLocation,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Your Location',
      });
      
      // If no city is selected, center map on user location
      if (!cityId) {
        setMapCenter(userLocation);
        setMapZoom(13);
        map.setCenter(userLocation);
        map.setZoom(13);
      }
    }

    // Update map center and zoom if city is selected
    if (cityData?.city) {
      const cityLocation = {
        lat: parseFloat(cityData.city.latitude),
        lng: parseFloat(cityData.city.longitude),
      };
      
      setMapCenter(cityLocation);
      setMapZoom(12);
      map.setCenter(cityLocation);
      map.setZoom(12);
    }

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [mapRef.current, cityData, userLocation]);

  // Add place markers to the map
  useEffect(() => {
    if (!mapInstanceRef.current || !placesData?.places) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    placesData.places.forEach((place: any) => {
      if (place.latitude && place.longitude) {
        const marker = createMapMarker({
          map: mapInstanceRef.current!,
          position: {
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
          },
          title: place.name,
          categoryId: place.categoryId,
        });

        // Add click listener to show place details
        marker.addListener('click', () => {
          setSelectedPlace(place);
        });

        markersRef.current.push(marker);
      }
    });

    // Adjust map bounds to fit all markers if no city is selected
    if (!cityId && markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      mapInstanceRef.current.fitBounds(bounds);
      
      // Don't zoom in too much for a single marker
      const listener = google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current!.getZoom()! > 15) {
          mapInstanceRef.current!.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [placesData, mapInstanceRef.current]);

  // Handle clicking outside the place details to close it
  const handleMapClick = () => {
    setSelectedPlace(null);
  };

  if (isLoading) {
    return (
      <div className={`relative h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (!placesData?.places?.length) {
    return (
      <div className={`relative h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-6">
          <i className="fas fa-map-marked-alt text-5xl text-gray-400 mb-3"></i>
          <h3 className="font-semibold text-lg mb-2">No places found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters or explore a different area.</p>
          <button
            onClick={() => setLocation('/explore')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            View All Places
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      <div 
        ref={mapRef} 
        className="absolute inset-0 bg-gray-100"
        onClick={handleMapClick}
      ></div>
      
      {selectedPlace && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 bg-white shadow-lg transition-transform z-10 max-h-1/2 overflow-auto"
        >
          <PlaceDetails 
            place={selectedPlace} 
            onClose={() => setSelectedPlace(null)} 
            userLocation={userLocation}
          />
        </div>
      )}
    </div>
  );
}
